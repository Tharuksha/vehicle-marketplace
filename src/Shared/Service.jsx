const FormatResult=(resp)=>{
    let result=[];
    let finalResult=[];
    
    // Debug the response
    console.log("Original response:", resp);
    
    resp.forEach((item)=>{
        const listingId=item.carListing?.id;
        if(!result[listingId])
        {
            result[listingId]={
                car:item.carListing,
                images:[]
            }
        }

        if(item.carImages)
        {
            result[listingId].images.push(item.carImages)
        }
    })
   
    result.forEach((item)=>{
        if (item) {
            finalResult.push({
                ...item.car,
                images:item.images
            })
        }
    })
    
    // Debug the final result
    console.log("Final formatted result:", finalResult);
    if (finalResult.length > 0) {
        console.log("Sample image data:", finalResult[0].images);
    }
 
    return finalResult;
}

export default { FormatResult };

