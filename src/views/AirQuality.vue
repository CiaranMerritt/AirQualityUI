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


/**
 * the data from when it worked for five seconds
 * 
 * "meta": {
        "name": "openaq-api",
        "license": "CC BY 4.0d",
        "website": "https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/",
        "page": 1,
        "limit": 100,
        "found": 12516
    },
    "results": [{
            "location": "Wekerom-Riemterdijk",
            "city": "Wekerom",
            "country": "NL",
            "coordinates": {
                "latitude": 52.1116,
                "longitude": 5.70842
            },
            "measurements": [
                {
                    "parameter": "pm25",
                    "value": 13.3746,
                    "lastUpdated": "2022-03-13T21:00:00Z",
                    "unit": "µg/m³",
                    "sourceName": "Netherlands",
                    "averagingPeriod": {
                        "value": 86400,
                        "unit": "seconds"
                    }
                },
                {
                    "parameter": "no2",
                    "value": 15.99,
                    "lastUpdated": "2022-03-13T21:00:00Z",
                    "unit": "µg/m³",
                    "sourceName": "Netherlands",
                    "averagingPeriod": {
                        "value": 3600,
                        "unit": "seconds"
                    }
                },
                {
                    "parameter": "pm10",
                    "value": 19.79,
                    "lastUpdated": "2022-03-13T21:00:00Z",
                    "unit": "µg/m³",
                    "sourceName": "Netherlands",
                    "averagingPeriod": {
                        "value": 86400,
                        "unit": "seconds"
                    }
                },
                {
                    "parameter": "o3",
                    "value": 65.78,
                    "lastUpdated": "2022-03-13T21:00:00Z",
                    "unit": "µg/m³",
                    "sourceName": "Netherlands",
                    "averagingPeriod": {
                        "value": 3600,
                        "unit": "seconds"
                    }
                }
            ]
        },
 */


const savedCities = ref<Array<ISavedCity>>([])
const cityAirQuality = ref<any>()
const modalTitle = ref<string>("Modal title");
const cityName = ref<string>("");
const countryName = ref<string>("");
const lastUpdated = ref<string>("");
const parameters = ref<string>("");
const alertMessage = ref<string>("");
const isWaitingForResponse = ref<boolean>(false);


function refreshData() {
    axios.get(APIUrls.BaseAPIUrl + 'savedcity')
        .then((response: any) => {
            savedCities.value = response.data;
        });
}


/*
{"country":"GB","city":"Aberdeen","count":161282393,"locations":3,"firstUpdated":"2016-02-27T20:00:00+00:00","lastUpdated":"2021-02-01T12:00:00+00:00","parameters":["no2","o3","pm10","pm25"]}
*/


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
    cityAirQuality.value = null;
    alertMessage.value = '';
    const config = {

        withCredentials: false,
        validateStatus: (status: number) => {
            return status < 500;
        },

    };
    isWaitingForResponse.value = true;
    axios.get('https://api.openaq.org/v1/latest?limit=100&page=1&offset=0&sort=desc&radius=1000&country_id=' + city?.CountryName + '&city=' + city?.CityName + '&order_by=lastUpdated&dumpRaw=false', config)
        .then((response: any) => {
            cityAirQuality.value = null;
            cityAirQuality.value = response.results;
            console.log(response.data.results);
            console.log(response)
            isWaitingForResponse.value = false;
        }).catch((error) => {
            isWaitingForResponse.value = false;
            alertMessage.value = error.message + ": " + error.response.data.message;
            console.log(error.response);
        });
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
                        class="btn btn-success mr-1"
                        data-bs-toggle="modal"
                        data-bs-target="#departmentModal"
                        @click="updateModal(city, 'City Air Quality')"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-search"
                            viewBox="0 0 16 16"
                        >
                            <path
                                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
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

                    <div v-if="cityAirQuality != null">
                        <span class="text-center">
                            <strong>{{ cityAirQuality.location }}</strong>
                        </span>
                        <span class="text-center">
                            <strong>{{ cityAirQuality.city }}</strong>
                        </span>
                        <span class="text-center">
                            <strong>{{ cityAirQuality.country }}</strong>
                        </span>
                    </div>

                    <div class="tableFixHead" v-if="cityAirQuality != null">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Parameter</th>
                                    <th>Value</th>
                                    <th>Unit</th>
                                    <th>Average Period</th>
                                    <th>Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(searchedCity, index) in cityAirQuality.measurements">
                                    <td>{{ index }}</td>
                                    <td>{{ searchedCity.parameter }}</td>
                                    <td>{{ searchedCity.value }}</td>
                                    <td>{{ searchedCity.unit }}</td>
                                    <td>{{ searchedCity.averagingPeriod.value }} {{ searchedCity.averagingPeriod.unit }}</td>
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
