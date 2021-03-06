<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'

//Components
import HelloWorld from '../components/HelloWorld.vue'

//Enums
import APIUrls from '../enums/EapiUrls';

//Interfaces
import IDepartment from '../interfaces/idepartment';
import ISavedCity from '../interfaces/isavedCity';


const savedCities = ref<Array<ISavedCity>>([])
const searchedCities = ref<Array<any>>([]);
const filterSearch = ref<string>("");
const filteredSearchedCities = computed(() => searchedCities.value.filter((city) => { return city.city.toUpperCase().includes(filterSearch.value.toUpperCase()) }))
const modalTitle = ref<string>("Modal title");
const modalSearchCountryCode = ref<string>("");
const alertMessage = ref<string>("");
const isWaitingForResponse = ref<boolean>(false);

//Refresh the table from the db endpoint
function refreshData() {
    axios.get(APIUrls.BaseAPIUrl + 'savedcity')
        .then((response: any) => {
            savedCities.value = response.data;
        });
}

// Searching for a new city to add
function searchCities() {
    alertMessage.value = "";
    // Country code only can be two digits to be valid
    if (modalSearchCountryCode.value != "" && modalSearchCountryCode.value.length <= 2) {
        const config = {

            withCredentials: false,
            validateStatus: (status: number) => {
                return status < 500;
            },

        };
        isWaitingForResponse.value = true;
        axios.get('https://docs.openaq.org/v2/cities?limit=1000&page=1&offset=0&sort=asc&country_id=' + modalSearchCountryCode.value + '&order_by=city', config)
            .then((response: any) => {
                searchedCities.value = [];
                searchedCities.value.push(...response.data.results);
                console.log(response.data.results);
                console.log(response)
                isWaitingForResponse.value = false;
            }).catch((error) => {
                isWaitingForResponse.value = false;
                alertMessage.value = error.message;
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

//Delete city from database
function deleteCity(city: ISavedCity) {
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
    alertMessage.value = "";
    modalTitle.value = title
}

onMounted(() => {
    console.log('Mounted')
    refreshData();
});
</script>

<template>
    <HelloWorld msg="Cities" />

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
                    <button type="button" class="btn btn-danger mr-1" @click="deleteCity(city)">
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

                    <button
                        type="button"
                        class="btn btn-primary m-2"
                        @click="searchCities()"
                        :disabled="isWaitingForResponse"
                    >Search</button>

                    <div v-if="isWaitingForResponse">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-arrow-repeat svgSpinner"
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"
                            />
                            <path
                                fill-rule="evenodd"
                                d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                            />
                        </svg>
                    </div>

                    <div
                        v-if="alertMessage != ''"
                        class="alert alert-danger fade show"
                        role="alert"
                    >
                        <strong>{{ alertMessage }}</strong>
                        <!-- <button
                            type="button"
                            class="btn-close"
                            data-bs-dismiss="alert"
                            aria-label="Close"
                        ></button>-->
                    </div>

                    <div class="input-group mb-3" v-if="searchedCities.length > 0">
                        <span class="input-group-text">Filter</span>
                        <input type="text" class="form-control" v-model="filterSearch" />
                    </div>

                    <div class="tableFixHead" v-if="searchedCities.length > 0">
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
                                <tr v-for="(searchedCity, index) in filteredSearchedCities">
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
<style scoped>
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

.svgSpinner {
    top: 50%;
    left: 50%;
    width: 5%;
    height: 5%;
    animation-name: spin;
    animation-duration: 1000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
