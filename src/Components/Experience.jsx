const Experience = ({ className = "", experience = [] }) => {
  return (
    <div className={`${className} px-8 border-l-2 border-gray-400 flex flex-col gap-8`}>
      {experience.map((exp, index) => {
        return (
          <article key={`exp-${index}`} className="flex lg:gap-6 gap-3 lg:flex-row flex-col">
            <div className="lg:w-64">
              <h4 className="text-xl relative -ml-[1px]">
                <div className="h-1/2 aspect-square bg-strong1 rounded-full absolute top-1/2 -translate-y-1/2 -left-8 -translate-x-1/2"></div>
                <strong>{exp.title}</strong>
              </h4>
              <h4 className="font-semibold">{exp.company}</h4>
              <p className="second font-bold">{`${exp.start} - ${exp.after}`}</p>
            </div>
            <p className="w-full-64 text-clip">{exp.description}</p>
          </article>
        )
      })}
    </div>
  )
}

export default Experience;