import {ImStatsDots} from "react-icons/im"
export default function Home() {
  return (
  <header className="flex items-center justify-between">
       <div className="flex items-center gap-2">
      <div className="h-[40px] w-[40px] rounded-full overflow-hidden">
      <img 
      className="w-full h-full object-cover"
      src="https://t4.ftcdn.net/jpg/00/79/77/19/360_F_79771929_dkEtuIuxFdNOlv6Evj1Nj1kaSLgSas34.jpg" 
      alt="" 
      />
      </div>
      <small>HI, any </small>
      </div>

      <nav className="flex items-center gap-2">
        <div> <ImStatsDots className="text-2xl" /> </div>
        <div>
          <button className="px-4 py-2 text-sm capitalize rounded-xl bg-red-600 text-white border-l-red-600">
            Sign out
          </button>
        </div>
      </nav>
  </header>
  )
}
