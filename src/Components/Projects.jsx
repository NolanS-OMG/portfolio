import { FaLink, FaGithub } from "react-icons/fa";

const Projects = ({ className = "", projects = [], articleClassName = "projects-half" }) => {
  return (
    <div className={`${className} flex flex-wrap gap-2 justify-center`}>
      {projects.map((pro, index) => {
        return (
          <article key={`project-${index}`} className={`py-1 px-2 ${articleClassName} w-full`}>
            <div className="relative rounded-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-black/60 flex image-hover font-bold"><h4 className="m-auto text-xl px-3 py-1 rounded-full bg-black/30">{pro.title}</h4></div>
              <img src={pro.img} alt={pro.alt} className="w-full aspect-video object-cover" />
            </div>
            <div className="flex flex-wrap gap-1 text-xs my-2 font-extrabold strong">
              {pro.skills.map((skill, i) => {
                return (
                  <span key={`project-${index}-skill-${i}`} className="bg1-color rounded-full px-2 py-1">{skill}</span>
                )
              })}
            </div>
            <p className="lg:text-base text-sm">{pro.description}</p>
            <div className="flex flex-wrap gap-3 text-lg lg:mt-4 my-6">
              {pro.github && <a href={pro?.github} target="_blank" className="flex gap-2 px-4 py-2 bg1-color rounded-xl border border-gray-400 items-center transition-all duration-75 hover:duration-200 hover:scale-105 hover:shadow-lg hover:shadow-white/10"><FaGithub size={20} /><span>Go to code</span></a>}
              {pro.page && <a href={pro?.page} target="_blank" className="flex gap-2 px-4 py-2 bg1-color rounded-xl border border-gray-400 items-center transition-all duration-75 hover:duration-200 hover:scale-105 hover:shadow-lg hover:shadow-white/10"><FaLink size={16} /><span>Go to page</span></a>}
            </div>
          </article>
        )
      })}
    </div >
  )
}

export default Projects;