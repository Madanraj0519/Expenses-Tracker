import React from "react";
import { AiOutlineLogin } from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaChartBar } from "react-icons/fa";
import { HiOutlineReceiptRefund, HiOutlineShoppingBag } from "react-icons/hi";
import { RxPerson } from "react-icons/rx";
import { FaHeart } from "react-icons/fa";
import { signOut } from "../Feature/Auth/userAuthSlice";
import { useDispatch } from 'react-redux';
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";


const SideBar = ({ setActive, active }) => {

    // const navigate = useNavigate();
    const {currentUser} = useSelector(state => state.authUser);
    const dispatch = useDispatch();

    const handleSignOut = async() => {
      try {
          dispatch(signOut());
          localStorage.clear();
      } catch (error) {
          console.log(error);
      }
  }

  return (
    <div className="large:w-full w-[300px] base:w-[100px] h-[60px] base:h-full flex base:flex-col justify-center 
     base:ml-0 bg-[#090e3d8b] shadow-sm rounded-[15px] border-4 border-white border-opacity-60 base:p-3 pt-4 px-8">

      <div className="flex flex-col justify-center items-center -mt-2 base:-mt-0 mb-2 base:mb-0 mr-2 base:mr-0">
        <img className="h-48 w-48 base:w-20 base:h-20 object-cover rounded-full" src="https://as1.ftcdn.net/v2/jpg/05/99/32/28/1000_F_599322870_hufBazDahX69a57xhcprgfn4WSjAlXZj.jpg" />
        <span className="large:block hidden font-semibold mt-2">Welcome 🎉, {currentUser.user.userName}</span>
      </div>

      <div
        className={`flex items-center base:mt-3 ${active === 1  ? 'base:bg-[#e7e3e3ed]' : 'base:hover:bg-[#000000c4]'} cursor-pointer w-full base:w-auto mb-4  base:h-12 px-2
        hover:scale-100 hover:duration-100 base:p-4 rounded-base`}
        onClick={() => setActive(1)}
      >
        <FaChartBar  size={20} color={active === 1 ? "red" : "white"} />
        <span
          className={`pl-3 ${
            active === 1 ? "text-red-800" : "text-white"
          } large:block hidden`}
        >
          Dashboard
        </span>
      </div>

      <div
        className={`flex items-center ${active === 2  ? 'base:bg-[#e7e3e3ed]' : 'base:hover:bg-[#000000c4]'} cursor-pointer w-full base:w-auto mb-4 base:h-12 px-2
        hover:scale-100 hover:duration-100 base:p-4 rounded-base`}
        onClick={() => setActive(2)}
      >
        <HiOutlineShoppingBag size={20} color={active === 2 ? "red" : "white"} />
        <span
          className={`pl-3 ${
            active === 2 ? "text-[red]" : "text-white"
          } large:block hidden`}
        >
          Income
        </span>
      </div>

      <div
        className={`flex items-center ${active === 3  ? 'base:bg-[#e7e3e3ed]' : 'base:hover:bg-[#000000c4]'} cursor-pointer w-full base:w-auto mb-4 base:h-12 px-2
        hover:scale-100 hover:duration-100 base:p-4 rounded-base`}
        onClick={() => setActive(3)}
      >
        <HiOutlineReceiptRefund size={20} color={active === 3 ? "red" : "white"} />
        <span
          className={`pl-3 ${
            active === 3 ? "text-[red]" : "text-white"
          } large:block hidden`}
        >
          Expense
        </span>
      </div>
      
      <div
      onClick={handleSignOut}
        className={`flex items-center ${active === 9  ? 'base:bg-red-300 ' : 'base:hover:bg-[#000000c4]'} cursor-pointer w-full base:w-auto mb-4 base:h-12 px-2
        hover:scale-100 hover:duration-100 base:p-4 rounded-base`}
        // onClick={logoutHandler}
      >
        <AiOutlineLogin size={20} color={active === 9 ? "red" : "white"} />
        <span
          className={`pl-3 ${
            active === 9 ? "text-[red]" : "text-white"
          } large:block hidden`}
        >
          Log out
        </span>
      </div>
    </div>
  )
}

export default SideBar