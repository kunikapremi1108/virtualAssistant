import axios from 'axios'
const geminiResponse=async(prompt)=>{
    try{
        const apiUrl=process.env.GEMINI_API_URL
        const result =await axios.post(apiUrl,{"contents": [
      {
        "parts": [
          {
            "text": prompt
          }
        ]
      }
    ]})
    return result.data
    }catch(error){
        console.log(error)
    }
}

export default geminiResponse