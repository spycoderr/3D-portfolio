export const profile = {
  name: "Nilabh Kishore Gupta",
  role: "Computer Science and Engineering Student",
  place: "Thapar Institute, Patiala",
  batch: "Batch of 2028",
  pitch:
    "I build full-stack web and business applications end to end: requirements, schema, APIs, tests and deployment. Looking for Application Engineering internships.",
  // The About section below the hero, one paragraph per entry.
  about: [
    "I'm a Computer Science and Engineering undergraduate at Thapar Institute of Engineering and Technology, graduating in 2028, with a 9.00 CGPA and 200+ LeetCode problems solved.",
    "Most of what I build is web and business software: internal tools and information systems, using Java, JavaScript, Python, the MERN stack and SQL. I like turning a business requirement into something people can actually use, and I care about the unglamorous parts that make it hold up, from technical design and REST APIs to testing, documentation, deployment and troubleshooting.",
  ],
  email: "kishoreguptanilabh@gmail.com",
  github: "https://github.com/spycoderr",
  linkedin: "https://linkedin.com/in/nilabh-kishore-gupta",
  leetcode: "https://leetcode.com/u/spycoder07",
  // Served from public/. Linked from the destination list as "My resume".
  resume: "/resume.pdf",
  // Bottom right, beside a small accent dot.
  location: "Patiala, India",
  skills: [
    { label: "Languages", items: ["C++", "Java", "Python", "JavaScript (ES6+)", "SQL"] },
    {
      label: "Web",
      items: ["MERN stack", "React", "Node.js", "Express", "RESTful APIs", "JWT authentication", "Role-based access control"],
    },
    { label: "Databases", items: ["MySQL", "MongoDB", "Mongoose", "Schema design"] },
    { label: "Data & ML", items: ["Pandas", "NumPy", "scikit-learn", "Matplotlib", "Seaborn"] },
    { label: "Tools", items: ["Git", "GitHub Actions", "Postman", "Jest", "VS Code", "Jupyter"] },
  ],
  timeline: [
    { year: "2024", label: "97th percentile in JEE Mains" },
    { year: "Aug 2024", label: "Started B.Tech at Thapar Institute" },
    { year: "Sep 2024", label: "MLSC web team" },
    { year: "2025", label: "Registered for GSSoC" },
    { year: "2026", label: "Semifinalist, Flipkart GRID 8.0 Software Development Challenge" },
    { year: "Now", label: "Seeking Application Engineering internships" },
  ],
  stats: [
    { label: "LeetCode problems solved", value: "200+" },
    { label: "Contest rating", value: "1540" },
    { label: "CGPA", value: "9.00" },
  ],
} as const
