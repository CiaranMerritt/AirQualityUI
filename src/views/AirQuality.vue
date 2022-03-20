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
import ISavedCity from '../interfaces/isavedCity';


const savedCities = ref<Array<ISavedCity>>([])
const searchedCities = ref<Array<any>>([])
const modalTitle = ref<string>("Modal title");
const modalSearchCountryCode = ref<string>("");
const cityName = ref<string>("");
const countryName = ref<string>("");
const lastUpdated = ref<string>("");
const parameters = ref<string>("");


function refreshData() {
    axios.get(APIUrls.BaseAPIUrl + 'savedcity')
        .then((response: any) => {
            savedCities.value = response.data;
        });
}

function searchCities() {
    if (modalSearchCountryCode.value != "" && modalSearchCountryCode.value.length <= 2) {
        const config = {

            withCredentials: false,
            validateStatus: () => {
                return true; // I'm always returning true, you may want to do it depending on the status received
            },

        };
        axios.get('https://docs.openaq.org/v2/cities?limit=1000&page=1&offset=0&sort=asc&country_id=' + modalSearchCountryCode.value + '&order_by=city', config)
            .then((response: any) => {
                searchedCities.value = [];
                searchedCities.value.push(...response.data.results);
                console.log(response.data.results);
                console.log(response)
            }).catch((error) => {
                console.log(error);
            });
    }
    /*
    {"country":"GB","city":"Aberdeen","count":161282393,"locations":3,"firstUpdated":"2016-02-27T20:00:00+00:00","lastUpdated":"2021-02-01T12:00:00+00:00","parameters":["no2","o3","pm10","pm25"]}
    */
}

function addCity(city: any) {
    axios.post(APIUrls.BaseAPIUrl + 'savedcity', {
        CityName: city.city,
        CountryName: city.country,
        LastUpdated: city.lastUpdated,
        Parameters: city.parameters.toString(),
    })
        .then((response: any) => {
            refreshData();
            alert(response.data);
        });
}


function deleteDepartment(city: ISavedCity) {
    if (!confirm("Are you sure you want to delete")) {
        return;
    }
    axios.delete(APIUrls.BaseAPIUrl + 'savedcity/' + city.CityId)
        .then((response: any) => {
            refreshData();
            alert(response.data);
        });
}

function updateModal(city: ISavedCity | null, title: string) {
    modalTitle.value = title
}

onMounted(() => {
    console.log('Mounted')
    refreshData();
});
</script>

<template>
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Air Quality" />

    <button
        type="button"
        class="btn btn-primary m-2 float-end"
        data-bs-toggle="modal"
        data-bs-target="#departmentModal"
        @click="updateModal(null, 'Add New City')"
    >Find New City</button>

    <table class="table table-striped table-hover">
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">City Name</th>
                <th scope="col">Country ID</th>
                <th scope="col">Last Updated</th>
                <th scope="col">Available Parameters</th>
                <th scope="col">Delete City</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="city in savedCities">
                <th scope="row">{{ city.CityId }}</th>
                <td>{{ city.CityName }}</td>
                <td>{{ city.CountryName }}</td>
                <td>{{ city.LastUpdated }}</td>
                <td>{{ city.Parameters }}</td>
                <td>
                    <button
                        type="button"
                        class="btn btn-danger mr-1"
                        @click="deleteDepartment(city)"
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
        <div class="modal-dialog modal-xl modal-dialog-centered">
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
                        <span class="input-group-text">Country code</span>
                        <input type="text" class="form-control" v-model="modalSearchCountryCode" />
                    </div>

                    <button type="button" class="btn btn-primary" @click="searchCities()">Search</button>

                    <div class="tableFixHead">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Country</th>
                                    <th>City</th>
                                    <th>Last Updated</th>
                                    <th>Parameters</th>
                                    <th>Save</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(searchedCity, index) in searchedCities">
                                    <td>{{ index }}</td>
                                    <td>{{ searchedCity.country }}</td>
                                    <td>{{ searchedCity.city }}</td>
                                    <td>{{ searchedCity.lastUpdated }}</td>
                                    <td>{{ searchedCity.parameters.toString() }}</td>
                                    <td>
                                        <button
                                            type="button"
                                            class="btn btn-success mr-1"
                                            @click="addCity(searchedCity)"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                class="bi bi-plus-circle-fill"
                                                viewBox="0 0 16 16"
                                            >
                                                <path
                                                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"
                                                />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<!-- 
    {"country":"GB","city":"Aberdeen","count":161282393,"locations":3,"firstUpdated":"2016-02-27T20:00:00+00:00","lastUpdated":"2021-02-01T12:00:00+00:00","parameters":["no2","o3","pm10","pm25"]}
     -->
<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}

.tableFixHead {
    overflow: auto;
    height: 40vh;
}
.tableFixHead thead th {
    position: sticky;
    top: 0;
    z-index: 1;
}

/* Just common table stuff. Really. */
.tableFixHead table {
    border-collapse: collapse;
    width: 100%;
}
th,
td {
    padding: 8px 16px;
}
th {
    background: #eee;
}
</style>
