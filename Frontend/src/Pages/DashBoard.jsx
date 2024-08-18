import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Loading from "../Components/Loading";
import SideBar from "../Components/SideBar";
import DashboardRight from "../Pages/DashboardRight";


const DashBoard = () => {
    const { loading } = useSelector((state) => state.authUser);

    const [active, setActive] = useState(() => {

      const activeNumber = localStorage.getItem('active');

      return activeNumber ? JSON.parse(activeNumber) : 1;
    });

    useEffect(() => {
      localStorage.setItem('active', JSON.stringify(active));
    }, [active]);
  
    return (
      <div className="w-full h-full">
        {loading ? (
          <Loading />
        ) : (
           <>
            <div className={`max-w-full mx-2 base:mx-8 flex flex-col base:flex-row justify-between  x-small:items-start gap-2 base:gap-4 large:items-start h-full py-4`}>
               <div className="w-[50px] base:w-[335px] sticky">
                 <SideBar active={active} setActive={setActive} />
               </div>
                 <DashboardRight active={active} />
            </div>
          </>
        )} 
      </div>
    );
}

export default DashBoard