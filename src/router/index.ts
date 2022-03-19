import {createRouter, createWebHistory} from 'vue-router'

import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Employee from '../views/Employee.vue'
import Department from '../views/Department.vue'

const routes = [
    {
        path: '/', name: 'Home', component: Home
    },
    {
        path: '/about', name: 'About', component: About
    },
    {
        path: '/employee', name: 'Employee', component: Employee
    },
    {
        path: '/department', name: 'Department', component: Department
    }
]

const router = createRouter({
    history: createWebHistory(),

    routes
})

export default router;