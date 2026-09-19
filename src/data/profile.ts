export const profile = {
  name: "Nilabh Kishore Gupta",
  role: "Computer Engineering Student",
  place: "Thapar Institute, Patiala",
  batch: "Batch of 2028",
  pitch: "", // Written in Phase 8
  email: "nilabhxintern@gmail.com",
  github: "https://github.com/spycoderr",
  linkedin: "https://linkedin.com/in/nilabh-kishore-gupta",
  leetcode: "https://leetcode.com/u/spycoder07",
  // Served from public/. Linked from the destination list as "My resume".
  resume: "/resume.pdf",
  // Bottom right, beside a small accent dot.
  location: "Patiala, India",
  skills: {
    languages: ["JavaScript", "TypeScript", "Python", "C++"],
    frontend: ["React", "Tailwind CSS", "Framer Motion"],
    backend: ["Node.js", "Express", "MongoDB"],
    tools: ["Git", "Vite", "VS Code"],
  },
  timeline: [
    { year: "2024", label: "JEE 2024" },
    { year: "2024", label: "Joined Thapar Institute" },
    { year: "2025", label: "Started building projects" },
    { year: "2025", label: "Registered for GSSoC" },
    { year: "Now", label: "Current focus" },
  ],
  stats: [
    { label: "LeetCode problems solved", value: "200+" },
    { label: "Contest rating", value: "1540" },
    { label: "CGPA", value: "9.0" },
  ],
} as const
