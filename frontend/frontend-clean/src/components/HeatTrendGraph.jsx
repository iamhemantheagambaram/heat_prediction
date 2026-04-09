import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function HeatTrendGraph({lat,lon}) {

const [data,setData] = useState([])

useEffect(()=>{

fetch("http://localhost:5000/api/heat-trend",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({lat,lon})
})
.then(res=>res.json())
.then(data=>setData(data))

},[lat,lon])

return(

<div style={{marginTop:"30px"}}>

<h2>5 Day Heat Trend Prediction</h2>

<LineChart width={600} height={300} data={data}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="day"/>

<YAxis/>

<Tooltip/>

<Line type="monotone" dataKey="temperature"/>

</LineChart>

</div>

)

}