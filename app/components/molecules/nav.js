import {ImStatsDots} from "react-icons/im"

function Nav(){
    return (
    <header className="container max-w-4xl px-6 py-6 mx-auto">
    <div className="flex items-center justify-between">
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
          <button className="btn btn-danger">
            Sign out
          </button>
        </div>
      </nav>
      </div>
  </header>
    )
}
export default Nav