import React, {useState, useEffect} from 'react';
import { FaPlus } from 'react-icons/fa';

const CustomCategory = ({category, setCategory}) => {

    const [categoryList] = useState(["Movies", "Parking", "Food", "Purchase", "Games", "Dress", "Service",]);
    const [customCategories, setCustomCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [isActive, setIsActive] = useState(false);


    useEffect(() => {
        const storedCustomCategories = JSON.parse(localStorage.getItem('customCategories'));
        if (storedCustomCategories) {
          setCustomCategories(storedCustomCategories);
        }
      }, []);

      const handleAddCustomCategory = () => {
        if (newCategory.trim() !== '' && !customCategories.includes(newCategory)) {
          const updatedCategories = [...customCategories, newCategory];
          setCustomCategories(updatedCategories);
          setNewCategory('');
          setCategory(newCategory);
    
          // Save updated custom categories to localStorage
          localStorage.setItem('customCategories', JSON.stringify(updatedCategories));
        }
      };


  return (
    <>
      <select className=' p-2 rounded-lg bg-[#f9f4f46f] border-2 cursor-pointer text-black font-medium border-[#ffffffef]'
                  value={category} onChange={(e) => setCategory(e.target.value)} >
                  <option>Category</option>
                  {
                    categoryList.map((item) => (
                      <option value={item}>{item}</option>
                    ))
                  }
                   {customCategories.map((category, index) => (
                      <option key={index} value={category}>
                       {category}
                      </option>
                    ))}
                  <option value='others'>Custom</option>
                </select>

                {
                  category === 'others' && (
                  <>
                   <div className='flex items-center justify-end gap-1'>
                      <input type='text-' placeholder='Create Own Category' 
                      value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                      id='userEmail' className=' p-2 rounded-lg bg-[#f9f4f46f] w-[200px] base:w-[300px] border-2 text-black font-medium border-[#ffffffef]' />
                      <div 
                      onClick={handleAddCustomCategory} 
                      className='bg-green-500 p-2 text-2xl cursor-pointer rounded-md text-[#f9f4f4ea]'>
                        <FaPlus />
                      </div>
                   </div>    
                  </>
                 )
                }
    </>
  )
}

export default CustomCategory