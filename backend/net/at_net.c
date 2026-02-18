#include "at_net.h"
#include "../../core/src/at_internal.h"
#include "../../core/src/at_voxel.h"
#include "acoustic/at.h"
#include "cJSON.h"
#include <curl/curl.h>

typedef struct curl_slist curl_slist;

AT_Result AT_simulation_to_json(cJSON **out_json, AT_Simulation *simulation)
{
    if (!out_json || *out_json || !simulation) return AT_ERR_INVALID_ARGUMENT;

    size_t FRAME_NUM_BUFFER_LENGTH = sizeof(uint8_t);
    cJSON *json = cJSON_CreateObject();

    AT_Voxel* voxels = simulation->voxel_grid;
    uint32_t num_voxels = simulation->num_voxels;
    uint32_t num_bins = AT_voxel_get_num_bins(simulation);

    for (uint32_t f = 0; f < num_bins; f++) {

        char frame_num[FRAME_NUM_BUFFER_LENGTH];
        sprintf(frame_num, "frame_%d", f);

        cJSON *frame_data = cJSON_CreateArray();

        for (uint32_t v = 0; v < num_voxels; v++) {

            AT_Voxel voxel = voxels[v];

            float energy = (f < voxel.count) ? voxel.items[f] : 0;

            // TODO: IF ENERGY OVER MIN THRESHOLD
            if (energy <= 0) continue;

            char voxel_num[num_voxels];
            sprintf(voxel_num, "%d", v);

            cJSON *voxel_data = cJSON_CreateObject();

            cJSON_AddNumberToObject(voxel_data, voxel_num, energy);
            cJSON_AddItemToArray(frame_data, voxel_data);
        }

        cJSON_AddItemToObject(json, frame_num, frame_data);
    }
    *out_json = json;
    return AT_OK;
}

AT_Result AT_send_json_to_url(cJSON *json, const AT_NetworkConfig *config)
{
    if (!json || !config) return AT_ERR_INVALID_ARGUMENT;

    CURL *curl = curl_easy_init();
    if (!curl) return AT_ERR_NETWORK_FAILURE;

    char *json_str = cJSON_PrintUnformatted(json);
    if (!json_str) return AT_ERR_INVALID_ARGUMENT;

    curl_slist *headers = NULL;
    headers = curl_slist_append(headers, "Content-Type: application/json");

    curl_easy_setopt(curl, CURLOPT_URL, config->url);
    curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, json_str);

    if (config->timeout_ms > 0) {
        curl_easy_setopt(curl, CURLOPT_TIMEOUT_MS, config->timeout_ms);
    }

    CURLcode res = curl_easy_perform(curl);

    long http_status = 0;
    curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &http_status);
    if (config->http_status_out) *config->http_status_out = (int)http_status;

    curl_slist_free_all(headers);
    curl_easy_cleanup(curl);
    free(json_str);

    if (res != CURLE_OK) return AT_ERR_NETWORK_FAILURE;
    if (http_status < 200 || http_status >= 300) return AT_ERR_NETWORK_FAILURE;

    return AT_OK;
}
