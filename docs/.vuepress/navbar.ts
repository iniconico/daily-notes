import {type NavbarConfig} from "vuepress-theme-reco/lib/types/nav";

const backend_navbar = [
    {text: "Java", link: "/series/back-end/java/"},
    {text: "并发编程", link: "/series/back-end/concurrent/"},
    {text: "Spring", link: "/series/back-end/spring/"},
];
const frontEnd_navbar = [
    {text: "React", link: "/series/front-end/react/"},
    {text: "JavaScript", link: "/series/front-end/javascript/"},
    {text: "TypeScript", link: "/series/front-end/javascript/"},
    {text: "Vue", link: "/series/front-end/vue/"},
];
const serverEnd_navbar = [
    {text: "DataBase", link: "/series/server-end/db/"},
    {text: "Docker", link: "/series/server-end/docker/"},
    {text: "Kubernetes", link: "/series/server-end/kubernetes/"},
    {text: "Jenkins", link: "/series/server-end/jenkins/"},
];
const readNotes_navbar = [];
const networks_navbar = [];
const docs_navbar = [];

export const navbar: NavbarConfig = [
    {text: "Home", link: "/"},
    {text: "Blog", link: "/posts.html"},
    {text: "后端", children: backend_navbar},
    {text: "前端", children: frontEnd_navbar},
    {text: "服务端", children: serverEnd_navbar},
    {text: "读书笔记", children: readNotes_navbar},
    {text: "Docs", children: docs_navbar,},
    // {text: "Categories", link: "/categories/blogs/1.html"},
    // {text: "Tags", link: "/tags/Java/1.html"},
];