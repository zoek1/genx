export const uploadJSON = async (data) => {
  const endpoint = 'https://api.web3.storage/upload';
  const headers = {
        'Authorization': `Bearer ${process.env.REACT_APP_WEB_STORAGE}`,
        'Content-Type': 'application/json'
  }

  const response = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
  })

  return await response.json();

}