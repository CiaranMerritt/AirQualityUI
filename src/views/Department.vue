<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import axios from 'axios'
import { ref, onMounted } from 'vue'

//Components
import HelloWorld from '../components/HelloWorld.vue'

//Enums
import APIUrls from '../enums/EapiUrls';

//Interfaces
import IDepartment from '../interfaces/idepartment';


const departments = ref<Array<IDepartment>>([])
const modalTitle = ref<string>("Modal title");
const departmentName = ref<string>("");
const departmentId = ref<number>(0);

function refreshData() {
    axios.get(APIUrls.BaseAPIUrl + 'department')
        .then((response: any) => {
            departments.value = response.data;
        });
}

function addDepartment() {
    axios.post(APIUrls.BaseAPIUrl + 'department', {
        DepartmentName: departmentName.value
    })
        .then((response: any) => {
            refreshData();
            alert(response.data);
        });
}

function editDepartment() {
    axios.put(APIUrls.BaseAPIUrl + 'department', {
        DepartmentId: departmentId.value,
        DepartmentName: departmentName.value
    })
        .then((response: any) => {
            refreshData();
            alert(response.data);
        });

}

function deleteDepartment(dep: IDepartment) {
    if (!confirm("Are you sure you want to delete")) {
        return;
    }
    axios.delete(APIUrls.BaseAPIUrl + 'department/' + dep.DepartmentId)
        .then((response: any) => {
            refreshData();
            alert(response.data);
        });
}

function updateModal(dep: IDepartment | null, title: string) {
    modalTitle.value = title
    if (dep == null) {
        departmentId.value = 0;
        departmentName.value = '';
    }
    else {
        departmentId.value = dep.DepartmentId;
        departmentName.value = dep.DepartmentName;
    }

}

onMounted(() => {
    console.log('Mounted')
    refreshData();
});
</script>

<template>
    <HelloWorld msg="Department" />

    <button
        type="button"
        class="btn btn-primary m-2 float-end"
        data-bs-toggle="modal"
        data-bs-target="#departmentModal"
        @click="updateModal(null, 'Add Department')"
    >Create New Department</button>

    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">Department Name</th>
                <th scope="col">Edit</th>
                <th scope="col">Delete</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="department in departments">
                <th scope="row">{{ department.DepartmentId }}</th>
                <td>{{ department.DepartmentName }}</td>
                <td>
                    <button
                        type="button"
                        class="btn btn-secondary mr-1"
                        data-bs-toggle="modal"
                        data-bs-target="#departmentModal"
                        @click="updateModal(department, 'Edit Department')"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-pencil-square"
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"
                            />
                            <path
                                fill-rule="evenodd"
                                d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"
                            />
                        </svg>
                    </button>
                </td>
                <td>
                    <button
                        type="button"
                        class="btn btn-danger mr-1"
                        @click="deleteDepartment(department)"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-trash-fill"
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"
                            />
                        </svg>
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
    <div
        class="modal fade"
        id="departmentModal"
        tabindex="-1"
        aria-labelledby="departmentModalLabel"
        aria-hidden="true"
    >
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="department-modal-title">{{ modalTitle }}</h5>
                    <button
                        type="button"
                        class="btn btn-close"
                        data-bs-dismiss="modal"
                        aria-label="close"
                    ></button>
                </div>

                <div class="modal-body">
                    <div class="input-group mb-3">
                        <span class="input-group-text">Department Name</span>
                        <input type="text" class="form-control" v-model="departmentName" />
                    </div>

                    <button
                        type="button"
                        class="btn btn-primary"
                        v-if="departmentId == 0"
                        @click="addDepartment()"
                    >Create</button>

                    <button
                        type="button"
                        class="btn btn-primary"
                        v-if="departmentId != 0"
                        @click="editDepartment()"
                    >Update</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
