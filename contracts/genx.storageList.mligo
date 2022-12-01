#include "genx.mligo"

// Define your initial storage values as a list of LIGO variable definitions,
// the first of which will be considered the default value to be used for origination later on
// E.g. let aStorageValue : aStorageType = 10

let base: storage = {
      ledger = Big_map.empty;
      token_metadata = Big_map.empty;
      operators = Big_map.empty;
      metadata = Big_map.literal [
    	("", [%bytes {|tezos-storage:data|}]);
	    ("data", Metadata.metadata);
      ];
      genx = Big_map.empty;
}