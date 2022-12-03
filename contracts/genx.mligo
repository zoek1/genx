#import "./errors.mligo" "Errors"

module Metadata = struct
type t = (string,bytes) big_map

let metadata = [%bytes
{|{
	"name":"TestX",
	"description":"TestX for assets",
	"version":"0.1",
	"license":{"name":"MIT", "details":""},
	"authors":["M"],
	"homepage":"TestX.dev",
	"source":{"tools":[], "location":""},
	"interfaces":["TZIP-012-2020-11-17"],
	"errors":[],
	"views":[]

}|}]
end

module Operators = struct
   type owner    = address
   type operator = address
   type token_id = nat
   type t = ((owner * operator), token_id set) big_map

   let assert_authorisation (operators : t) (from_ : address) (token_id : nat) : unit = 
      let sender_ = (Tezos.get_sender ()) in
      if (sender_ = from_) then ()
      else 
      let authorized = match Big_map.find_opt (from_,sender_) operators with
         Some (a) -> a | None -> Set.empty
      in if Set.mem token_id authorized then ()
      else failwith Errors.not_operator

   let assert_update_permission (owner : owner) : unit =
      assert_with_error (owner = (Tezos.get_sender ())) "The sender can only manage operators for his own token"

   let add_operator (operators : t) (owner : owner) (operator : operator) (token_id : token_id) : t =
      if owner = operator then operators (* assert_authorisation always allow the owner so this case is not relevant *)
      else
         let () = assert_update_permission owner in
         let auth_tokens = match Big_map.find_opt (owner,operator) operators with
            Some (ts) -> ts | None -> Set.empty in
         let auth_tokens  = Set.add token_id auth_tokens in
         Big_map.update (owner,operator) (Some auth_tokens) operators
         
   let remove_operator (operators : t) (owner : owner) (operator : operator) (token_id : token_id) : t =
      if owner = operator then operators (* assert_authorisation always allow the owner so this case is not relevant *)
      else
         let () = assert_update_permission owner in
         let auth_tokens = match Big_map.find_opt (owner,operator) operators with
         None -> None | Some (ts) ->
            let ts = Set.remove token_id ts in
            if (Set.size ts = 0n) then None else Some (ts)
         in
         Big_map.update (owner,operator) auth_tokens operators
end

module Ledger = struct
   type owner    = address
   type token_id = nat
   type t = (token_id, owner) big_map

   let is_owner_of (ledger:t) (token_id : token_id) (owner: address) : bool =
      (** We already sanitized token_id, a failwith here indicated a patological storage *)
      let current_owner = Option.unopt (Big_map.find_opt token_id ledger) in
      current_owner=owner

    let add_token (ledger:t) (token_id: token_id): t =
      let sender = Tezos.get_sender() in 
      let ld = Big_map.add token_id sender ledger in
      ld

   let assert_owner_of (ledger:t) (token_id : token_id) (owner: address) : unit =
      assert_with_error (is_owner_of ledger token_id owner) Errors.ins_balance

   let transfer_token_from_user_to_user (ledger : t) (token_id : token_id) (from_ : owner) (to_ : owner) : t =
      let () = assert_owner_of ledger token_id from_ in
      let ledger = Big_map.update token_id (Some to_) ledger in
      ledger
end

module TokenMetadata = struct
   (**
      This should be initialized at origination, conforming to either 
      TZIP-12 : https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md#token-metadata
      or TZIP-16 : https://gitlab.com/tezos/tzip/-/blob/master/proposals/tzip-12/tzip-12.md#contract-metadata-tzip-016 
   *)
   type data = {token_id:nat;token_info:(string,bytes)map}
   type t = (nat, data) big_map 

   let add_new_token (md:t) (token_id : nat) (data:data) =
     let () = assert_with_error (not (Big_map.mem token_id md)) Errors.token_exist in
     let md = Big_map.add token_id data md in
     md
end

module Genx = struct
 type asset_id = nat
 type name = string
 type type_ = string (* String | Number | Boolean *)
 type value  = bytes
 type generation_id = nat * nat * nat // See major.minor.patch in https://semver.org/
 type gen = {
  type_: type_;
  value: value
 }
 type generation = (name, gen) map
 type generations = (generation_id, generation) map
 type t = (asset_id, generations) big_map

 let add_new_gen (genx:t) (asset_id: asset_id) (generation_id: generation_id) (generation: generation)  =
   let generations = match Big_map.find_opt asset_id genx with
       Some generations ->
         let () = assert_with_error (not Map.mem generation_id  generations) Errors.generation_exist in
         generations
     | None -> Map.empty
   in
   let generations = Map.add generation_id generation generations in
   let genx = Big_map.update asset_id (Some generations) genx in
   genx

  let nerf (genx:t) (asset_id: asset_id) (generation_id: generation_id) (name: name) (value: gen) =
    let generations = match Big_map.find_opt asset_id genx with
       Some generations -> generations
     | None -> failwith Errors.generations_not_exist
   in
   let generation = match Map.find_opt generation_id generations with
       Some generation -> generation
     | None -> failwith Errors.generation_not_exist
   in
   let generation = Map.update name (Some value) generation in
   let generations = Map.remove generation_id generations in
   let new_generation_id = (generation_id.0, generation_id.1, generation_id.2 + 1n) in
   let generations = Map.add new_generation_id generation generations in
   let genx = Big_map.update asset_id (Some generations) genx in
   genx

   let join_map map1 map2 = 
     let merge = fun (origin, gen : generation * (name * gen)) : generation ->
       let (name, value) = gen in
       if not Map.mem name origin 
       then Map.add name value origin 
       else Map.update name (Some value) origin
    in 
    Map.fold merge map2 map1


   let mutate (genx:t) (asset_id: asset_id) (generation_id: generation_id) (changes: generation) =
    let generations = match Big_map.find_opt asset_id genx with
       Some generations ->
         generations
     | None -> failwith Errors.generations_not_exist
   in
   let generation = match Map.find_opt generation_id generations with
       Some generation -> generation
     | None -> failwith Errors.generation_not_exist
   in
   let generation = join_map generation changes in
   let generations = Map.remove generation_id generations in
   let new_generation_id = (generation_id.0, generation_id.1 + 1n, 0n) in
   let generations = Map.add new_generation_id generation generations in
   let genx = Big_map.update asset_id (Some generations) genx in
   genx

  let evolve (genx:t) (asset_id: asset_id) (generation_id: generation_id) (changes: generation) =
    let generations = match Big_map.find_opt asset_id genx with
       Some generations ->
         generations
     | None -> failwith Errors.generations_not_exist
   in
   let generation = match Map.find_opt generation_id generations with
       Some generation -> generation
     | None -> failwith Errors.generation_not_exist
   in
   let new_generation_id = (generation_id.0 + 1n, 0n, 0n) in
   let generation = join_map generation changes in
   let generations = Map.add new_generation_id generation generations in
   let genx = Big_map.update asset_id (Some generations) genx in
   genx

end


module Storage = struct
   type token_id = nat
   type t = {
      ledger         : Ledger.t;
      operators      : Operators.t;
      token_metadata : TokenMetadata.t;
      metadata       : Metadata.t;
      genx           : Genx.t;
      counter        : nat
   }

   let is_owner_of (s:t) (owner : address) (token_id : token_id) : bool =
      Ledger.is_owner_of s.ledger token_id owner

   let assert_token_exist (s:t) (token_id : nat) : unit  = 
      let _ = Option.unopt_with_error (Big_map.find_opt token_id s.token_metadata)
         Errors.undefined_token in
      ()

   let get_token_metadata (s:t) = s.token_metadata
   let set_token_metadata (s:t) (token_metadata:TokenMetadata.t) = {s with token_metadata = token_metadata}

   let get_ledger (s:t) = s.ledger
   let set_ledger (s:t) (ledger:Ledger.t) = {s with ledger = ledger}

   let get_operators (s:t) = s.operators
   let set_operators (s:t) (operators:Operators.t) = {s with operators = operators}


   let get_genx (s:t) = s.genx
   let set_genx (s:t) (genx:Genx.t) = {s with genx = genx}
end


type storage = Storage.t

(** Transfer entrypoint *)
type atomic_trans = [@layout:comb] {
   to_      : address;
   token_id : nat;
}

type transfer_from = {
   from_ : address;
   tx    : atomic_trans list
}
type transfer = transfer_from list

let transfer : transfer -> storage -> operation list * storage =
   fun (t:transfer) (s:storage) ->
   (* This function process the "tx" list. Since all transfer share the same "from_" address, we use a se *)
   let process_atomic_transfer (from_:address) (ledger, t:Ledger.t * atomic_trans) =
      let {to_;token_id} = t in
      let ()     = Storage.assert_token_exist s token_id in
      let ()     = Operators.assert_authorisation s.operators from_ token_id in
      let ledger = Ledger.transfer_token_from_user_to_user ledger token_id from_ to_ in
      ledger
   in
   let process_single_transfer (ledger, t:Ledger.t * transfer_from ) =
      let {from_;tx} = t in
      let ledger     = List.fold_left (process_atomic_transfer from_) ledger tx in
      ledger
   in
   let ledger = List.fold_left process_single_transfer s.ledger t in
   let s = Storage.set_ledger s ledger in
   ([]: operation list),s

(** balance_of entrypoint 
*)
type request = {
   owner    : address;
   token_id : nat;
}

type callback = [@layout:comb] {
   request : request;
   balance : nat;
}

type balance_of = [@layout:comb] {
   requests : request list;
   callback : callback list contract;
}

(** Balance_of entrypoint *)
let balance_of : balance_of -> storage -> operation list * storage =
   fun (b: balance_of) (s: storage) ->
   let {requests;callback} = b in
   let get_balance_info (request : request) : callback =
      let {owner;token_id} = request in
      let ()       = Storage.assert_token_exist  s token_id in
      let balance_ = if Storage.is_owner_of s owner token_id then 1n else 0n in
      {request=request;balance=balance_}
   in
   let callback_param = List.map get_balance_info requests in
   let operation = Tezos.transaction callback_param 0tez callback in
   ([operation]: operation list),s

(** update operators entrypoint *)
type operator = [@layout:comb] {
   owner    : address;
   operator : address;
   token_id : nat; 
}

type unit_update      = Add_operator of operator | Remove_operator of operator
type update_operators = unit_update list

let update_ops : update_operators -> storage -> operation list * storage = 
   fun (updates: update_operators) (s: storage) -> 
   let update_operator (operators,update : Operators.t * unit_update) = match update with 
      Add_operator    {owner=owner;operator=operator;token_id=token_id} -> Operators.add_operator    operators owner operator token_id
   |  Remove_operator {owner=owner;operator=operator;token_id=token_id} -> Operators.remove_operator operators owner operator token_id
   in
   let operators = Storage.get_operators s in
   let operators = List.fold_left update_operator operators updates in
   let s = Storage.set_operators s operators in
   ([]: operation list),s

type create_token = {
   token_id : nat;
   data     : TokenMetadata.data;
}

let create ({token_id;data} : create_token) (s : storage) =
   let md = Storage.get_token_metadata s in
   let md = TokenMetadata.add_new_token md token_id data in
   let ld = Storage.get_ledger s in
   let ld = Ledger.add_token ld token_id in
   let s = Storage.set_token_metadata s md in
   let s = Storage.set_ledger s ld in
   let s = { s with counter = s.counter + 1n } in
   ([]: operation list),s

type add_gen = {
    token_id      : nat;
    generation_id : Genx.generation_id;
    generation    : Genx.generation;
}

type nerf_gen = {
    token_id      : nat;
    generation_id : Genx.generation_id;
    name: string;
    value: Genx.gen;
}
let add_gen ({token_id; generation_id; generation;} : add_gen) (s : storage) =
    let genx = Storage.get_genx s in
    let genx = Genx.add_new_gen genx token_id generation_id generation in
    let s = Storage.set_genx s genx in
    ([]: operation list),s


let evolve ({token_id; generation_id; generation;} : add_gen) (s : storage) =
    let genx = Storage.get_genx s in
    let genx = Genx.evolve genx token_id generation_id generation in
    let s = Storage.set_genx s genx in
    ([]: operation list),s


let mutate ({token_id; generation_id; generation;} : add_gen) (s : storage) =
    let genx = Storage.get_genx s in
    let genx = Genx.mutate genx token_id generation_id generation in
    let s = Storage.set_genx s genx in
    ([]: operation list),s

let nerf ({token_id; generation_id; name; value;} : nerf_gen) (s : storage) =
    let genx = Storage.get_genx s in
    let genx = Genx.nerf genx token_id generation_id name value in
    let s = Storage.set_genx s genx in
    ([]: operation list),s

type parameter = 
[@layout:comb] 
  | Transfer of transfer 
  | Balance_of of balance_of 
  | Update_operators of update_operators
  | Create_token of create_token
  (* Extend contract with GenX parameters*)
  | Add_gen of add_gen
  | Mutate of add_gen
  | Evolve of add_gen
  | Nerf of nerf_gen


let main ((p,s):(parameter * storage)) = 
match p with
     Transfer         p -> transfer   p s
  |  Balance_of       p -> balance_of p s
  |  Update_operators p -> update_ops p s
  |  Create_token     p -> create     p s
  (* Extend contract with GenX Entrypoints*)
  |  Add_gen          p -> add_gen    p s
  |  Mutate           p -> mutate     p s
  |  Evolve           p -> evolve     p s
  |  Nerf             p -> nerf       p s
