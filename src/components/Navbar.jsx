// import { useState } from 'react'
// import { useNavigate, useLocation } from 'react-router-dom'

// function Navbar({ name }) {
//   const [openDropdown, setOpenDropdown] = useState(false)
//   const navigate = useNavigate()
//   const location = useLocation()

//   const apps = [
//     { id: 'perception',   name: 'Perception Lens - Early Signals',   path: '/brand-perception/dashboard' },
//     { id: 'infringement', name: 'Digital Impersonation', path: '/brand_infridgement' },
//   ]

//   const infringementRoutes = ['/brand_infridgement', '/web-summary', '/web-incidents']

//   const isInfringement = infringementRoutes.some(
//     (route) => location.pathname === route || location.pathname.startsWith(route + '/')
//   )
//   const isPerception = location.pathname.startsWith('/brand-perception')

//   const currentApp = isInfringement
//     ? apps.find((a) => a.id === 'infringement')
//     : apps.find((a) => a.id === 'perception')

//   const handleAppSwitch = (path) => {
//     navigate(path)
//     setOpenDropdown(false)
//   }

//   return (
//     <div className="relative bg-white border-b border-[#D1D5DB] h-16 flex items-center justify-between px-6 shrink-0 z-30">

//         <div className="flex items-center z-10">
//         <img
//           src={`${import.meta.env.BASE_URL}DeloitteLogo.png`}
//           alt="Logo"
//           className="h-9 w-auto cursor-pointer object-contain"
//           onClick={() => navigate('/brand-perception/dashboard')}
//         />
//         <div className="h-5 w-px bg-gray-300 ml-3 mr-4" />
//         <h1 className="text-[15px] font-semibold text-gray-900 whitespace-nowrap">{name}</h1>
//       </div>

//       {/* Center: App switcher — absolutely centred */}
//       <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
//         <div className="relative">
//           <button
//             onClick={() => setOpenDropdown(!openDropdown)}
//             className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 transition-all cursor-pointer focus:outline-none whitespace-nowrap"
//           >
//             <span className="h-2 w-2 rounded-full bg-emerald-500" />
//             <span>{currentApp.name}</span>
//             <svg
//               className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openDropdown ? 'rotate-180' : ''}`}
//               fill="none" viewBox="0 0 24 24" stroke="currentColor"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//             </svg>
//           </button>

//           {openDropdown && (
//             <>
//               <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(false)} />
//               <div className="absolute left-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-50">
//                 <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
//                   Switch Application
//                 </div>
//                 {apps.map((app) => (
//                   <button
//                     key={app.id}
//                     onClick={() => handleAppSwitch(app.path)}
//                     className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
//                       currentApp.id === app.id
//                         ? 'bg-gray-100 text-gray-900'
//                         : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                     }`}
//                   >
//                     <span>{app.name}</span>
//                     {currentApp.id === app.id && (
//                       <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                       </svg>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Right: spacer */}
//       <div className="w-10 h-10 pointer-events-none opacity-0 z-10" />
//     </div>
//   )
// }

// export default Navbar







import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Navbar({ name, subname }) {
    const [openDropdown, setOpenDropdown] = useState(false);
    const navigate = useNavigate()

    const handleLogout = () => {
        navigate("/");
    };

    return (
        <div className="bg-white border-b border-[#D1D5DB] h-18 flex items-center justify-between px-4">
            <div className="flex items-center">
                <img
                    // src="/DeloitteLogo.png"
                    src={`${import.meta.env.BASE_URL}DeloitteLogo.png`}
                    alt="Deloitte"
                    className="w-30 h-30  cursor-pointer object-contain"
                    onClick={() => navigate('/')}
                />

                <div className="h-5 w-px bg-gray-400 ml-1 mr-4"></div>

                <div className="leading-tight">
                    <h1 className="text-lg font-semibold text-Black">{name}</h1>
                    
                </div>
            </div>

            {/* <div className="relative pr-5">
                <img
                    src="/user.png"
                    alt="profile"
                    className="w-8 h-8 rounded-2 cursor-pointer border"
                    onClick={() => setOpenDropdown(!openDropdown)}
                />

                {openDropdown && (
                    <div className="absolute right-0 mt-3 w-40 bg-white rounded-sm shadow-xl/30 shadow-[#6c6e6a] overflow-hidden">
                        <p className="w-full cursor-pointer text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                            Pravin
                        </p>
                        <button
                            onClick={handleLogout}
                            className="w-full cursor-pointer text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div> */}
        </div>
    );
}

export default Navbar;


