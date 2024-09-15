import React, { useState, useEffect } from "react";
import profile from "/profile.jpeg";
import { CiMail } from "react-icons/ci";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { PiSuitcaseSimpleBold } from "react-icons/pi";
import { FaCode } from "react-icons/fa";
import Experience from "./Components/Experience";
import Projects from "./Components/Projects";
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();
  const [lan, setLan] = useState("en");

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (lan) {
      changeLanguage(lan);
    }
  }, [lan]);

  const experience_en = [
    {
      title: "Software Developer",
      company: "Freelancer",
      start: "May 2024",
      after: "Currently",
      description: (
        <>
          Working on <strong className="light">2 projects</strong>: <br />
          - Private Schools landing page and administration system (stand by). <br />
          - AI chatbot for an Event Planner company.
        </>
      ),
    },
    {
      title: "Software Developer",
      company: "Innova Solutions",
      start: "January 2023",
      after: "January 2024",
      description: (
        <>
          I used all technologies on my hands depending on the requirements of the project
          and the commodity of the team. <strong className="light">2 projects</strong>. <br />
          Technologies used: <br />
          - React, React Native, TypeScript <br />
          - Java, Spring Boot, NodeJS, RestAPI <br />
          - AWS, Jenkins
        </>
      ),
    },
    {
      title: "Software Developer Intern",
      company: "Innova Solutions",
      start: "June 2022",
      after: "January 2023",
      description: (
        <>
          I learned Salesforce frameworks and CRM and finished <strong className="light">one inside project</strong> of the
          company. <br />
          Technologies used: <br />
          - Salesforce CRM, LWC, Apex <br />
          - HTML / CSS / JavaScript
        </>
      ),
    },
  ];
  const experience_es = [
    {
      title: "Software Developer",
      company: "Freelancer",
      start: "Mayo 2024",
      after: "Actualmente...",
      description: (
        <>
          Trabajando en <strong className="light">2 proyectos</strong>: <br />
          - Página web para landing y administración de escuelas privadas (detenido). <br />
          - AI chatbot para empresa de organización de eventos.
        </>
      ),
    },
    {
      title: "Software Developer",
      company: "Innova Solutions",
      start: "Enero 2023",
      after: "Enero 2024",
      description: (
        <>
          Se utilizaban las tecnologías necesarias según los requerimientos del cliente y las necesidades del equipo. <strong className="light">2 proyectos</strong>. <br />
          Tecnologías utilizadas: <br />
          - React, React Native, TypeScript <br />
          - Java, Spring Boot, NodeJS, RestAPI <br />
          - AWS, Jenkins
        </>
      ),
    },
    {
      title: "Software Developer Intern",
      company: "Innova Solutions",
      start: "Junio 2022",
      after: "Enero 2023",
      description: (
        <>
          Aprendí los frameworks de Salesforce y el uso de sus CRM además de trabajar en <strong className="light">un proyecto interno</strong> de la compañía. <br />
          Tecnologías utilizadas: <br />
          - Salesforce CRM, LWC, Apex <br />
          - HTML / CSS / JavaScript
        </>
      ),
    },
  ];

  const projects_en = [
    {
      img: "/colegios.PNG",
      alt: "Landing Page Colegios",
      title: "Schools Landing/Admin",
      skills: ["HTML", "CSS", "JavaScript", "React", "Tailwind", "Firebase"],
      description: (
        <>
          <strong className="light">ON DEV STAGE</strong>. Project for Schools where they can have their landing page and administration functions, which includes students grades, reports, announcements, posts and fathers supervision.
          It has responsive design and actually works for this 4 users.<br />
          <strong className="light">Test Users</strong>: 1, 2, 3, 4 <br />
          <strong className="light">Passwords</strong>: password
        </>
      ),
      page: "https://isolu-proyecto-colegios.netlify.app/"
    },
    {
      img: "/abcc.PNG",
      alt: "Inventory CRUD",
      title: "Inventory CRUD app",
      skills: ["HTML", "CSS", "JavaScript", "NodeJS", "MongoDB"],
      description: (
        <>
          A test I made for a job I did apply, in essence its just a CRUD, but it has some validations and specific details needed for the test.
        </>
      ),
      github: "https://github.com/NolanS-OMG/aplicacionabcc",
      page: "https://aplicacionabcc.netlify.app/"
    },
    {
      img: "/portadaProvisional.jpg",
      alt: "Portfolios Project",
      title: "Portfolios Project",
      skills: ["HTML", "CSS", "JavaScript"],
      description: (
        <>
          I make portfolios to different people, so I make a lobby page to show all portfolios I made (with the client consentment of course).
        </>
      ),
      github: "https://github.com/NolanS-OMG/portafolio_lobby",
      page: "https://lobby-portfolios.netlify.app/"
    },
  ];
  const projects_es = [
    {
      img: "/colegios.PNG",
      alt: "Landing Page Colegios",
      title: "Landing/Admin Escuelas",
      skills: ["HTML", "CSS", "JavaScript", "React", "Tailwind", "Firebase"],
      description: (
        <>
          <strong className="light">ETAPA DE DESARROLLO</strong>. Proyecto para escuelas donde tienen su landing y su sistema de administración, que incluye las calificaciones del alumno, los pagos, supervisión de los padres, manejo de eventos, etcétera.
          Tiene Responsive Design y actualmente es parcialmente funcional para 4 usuarios de desarrollo.<br />
          <strong className="light">Test Users</strong>: 1, 2, 3, 4 <br />
          <strong className="light">Passwords</strong>: password
        </>
      ),
      page: "https://isolu-proyecto-colegios.netlify.app/"
    },
    {
      img: "/abcc.PNG",
      alt: "Inventory CRUD",
      title: "Inventory CRUD app",
      skills: ["HTML", "CSS", "JavaScript", "NodeJS", "MongoDB"],
      description: (
        <>
          Una prueba de trabajo que realicé para un trabajo al cual, en efecto, apliqué; es en escencia un CRUD, pero con las especificaciones que me pedían en la práctica.
        </>
      ),
      github: "https://github.com/NolanS-OMG/aplicacionabcc",
      page: "https://aplicacionabcc.netlify.app/"
    },
    {
      img: "/portadaProvisional.jpg",
      alt: "Portfolios Project",
      title: "Portfolios Project",
      skills: ["HTML", "CSS", "JavaScript"],
      description: (
        <>
          Hago portafolios para distintas personas, así que hice un lobby para mostrarlos (con el consentimiento del cliente claro está).
        </>
      ),
      github: "https://github.com/NolanS-OMG/portafolio_lobby",
      page: "https://lobby-portfolios.netlify.app/"
    },
  ];

  return (
    <div className="relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1200px] light-shadow-background -z-10"></div>
      <nav className="sticky top-2 left-1/2 -translate-x-1/2 lg:flex hidden gap-4 rounded-full w-fit px-6 py-2 backdrop-blur-sm bg-white/10 z-10">
        <a href="#header" className="transition-all duration-75 hover:duration-200 light-hover hover:font-bold">
          {t("nav_home")}
        </a>
        <a href="#experience" className="transition-all duration-75 hover:duration-200 light-hover hover:font-bold">
          {t("nav_experience")}
        </a>
        <a href="#projects" className="transition-all duration-75 hover:duration-200 light-hover hover:font-bold">
          {t("nav_projects")}
        </a>
        <a href="mailto:nolan1scott3@gmail.com" className="transition-all duration-75 hover:duration-200 light-hover hover:font-bold">
          {t("nav_contact")}
        </a>
        <button className="text-sm font-bold strong px-1 py-0.5 hover:bg-white/20 rounded-sm" onClick={() => {
          if (lan === "es") {
            setLan("en");
            return
          }
          if (lan === "en") {
            setLan("es");
            return
          }
        }}>{lan.toUpperCase()}</button>
      </nav>

      <header className="h-section lg:px-32 px-4 lg:py-0 py-16 flex" id="header">
        <article className="lg:w-3/5 w-full h-fit my-auto">
          <div className="flex items-center lg:justify-start justify-center">
            <img className="w-20 aspect-square rounded-full mr-4" src={profile} alt="Imagen de perfil Nolan Ashcraft" />
            <a className="text-base h-fit my-auto bg1-color rounded-full font-normal green-gradient-border flex" href="/CV_Nolan_Ashcraft.pdf" download>
              <div className="green-gradient-border-wrapper"></div>
              <span className="bg1-color px-3 py-1 rounded-full">{t("cv")}</span>
            </a>
          </div>
          <h1 className="lg:text-7xl text-5xl font-extrabold mb-1">{t("welcome_title")}</h1>
          <p className="mb-4 text-lg" dangerouslySetInnerHTML={{ __html: t('welcome_desc') }} />
          <div className="flex lg:gap-3 gap-4 items-center lg:mt-0 mt-6">
            <a
              className="flex gap-2 bg1-color rounded-full lg:px-2 lg:py-1 lg:text-xs px-4 py-2 text-lg items-center border border-gray-400 transition-all duration-75 hover:duration-300 hover:scale-105"
              href="mailto:nolan1scott3@gmail.com"
            >
              <CiMail size={18} />
              <span>{t("contact_me")}</span>
            </a>
            <a className="transition-all duration-75 hover:duration-300 hover:scale-110" href="https://www.linkedin.com/in/nolan-ashcraft-a25963234/" target="_blank">
              <FaLinkedin size={24} className="lg:scale-100 scale-150" />
            </a>
            <a className="transition-all duration-75 hover:duration-300 hover:scale-110 lg:ml-0 ml-4" href="https://github.com/NolanS-OMG/" target="_blank">
              <FaGithub size={24} className="lg:scale-100 scale-150" />
            </a>
          </div>
        </article>
      </header>

      <section className="lg:px-32 px-4 pb-16" id="experience">
        <h4 className="text-4xl font-extrabold flex gap-3 items-center mb-8">
          <PiSuitcaseSimpleBold size={48} className="translate-y-0.5" />
          <span>{t("title_experience")}</span>
        </h4>
        <Experience experience={lan === "en" ? experience_en : experience_es} className="mb-32" />
      </section>

      <section className="lg:px-32 px-4 pb-16" id="projects">
        <h4 className="text-4xl font-extrabold flex gap-3 items-center mb-8">
          <FaCode size={48} className="translate-y-0.5" />
          <span>{t("title_projects")}</span>
        </h4>
        <Projects projects={lan === "en" ? projects_en : projects_es} articleClassName="projects-half" />
      </section>

    </div>
  );
}

export default App;
