import React from 'react';

const Rank = ( { count, name }) => {
    return (
     <div >
         <div className='white f3'>
            {
                `${name}, your current entry count is...`
            }
         </div>
         <div className='white f1'>
            {
                count
            }
         </div>
     </div>  
    )
}

export default Rank;