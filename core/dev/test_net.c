#include "../include/acoustic/at.h"
#include "../../backend/net/at_net.h"
#include "../include/acoustic/at_result.h"

int main()
{
    const char *filepath = "../assets/glb/L_room_roof.glb";

    AT_Model *model = NULL;
    AT_Result res = AT_model_create(&model, filepath);
    AT_handle_result(res, "Error creating model\n");

    AT_Source s1 = {
        .direction = {1, 0, 0},
        .intensity = 50.0f,
        .position = {0}
    };

    AT_Source sources[1];
    sources[0] = s1;

    AT_SceneConfig conf = {
        .environment = model,
        .material = AT_MATERIAL_PLASTIC,
        .num_sources = 1,
        .sources = sources
    };

    AT_Scene *scene = NULL;
    res = AT_scene_create(&scene, &conf);
    AT_handle_result(res, "Error creating scene\n");

    AT_Settings settings = {
        .fps = 60,
        .num_rays = 1,
        .voxel_size = 1
    };

    AT_Simulation *sim = NULL;
    res = AT_simulation_create(&sim, scene, &settings);
    AT_handle_result(res, "Error creating simulation\n");

    res = AT_simulation_run(sim);
    AT_handle_result(res, "Error running simulation\n");

    cJSON *json = NULL;
    AT_simulation_to_json(&json, sim);
    AT_handle_result(res, "Error converting simulation to JSON\n");

    int http_status = 0;
    AT_NetworkConfig net_conf = {
        .http_status_out = &http_status,
        .timeout_ms = 1000,
        .url = "http://0.0.0.0:80/post"
    };

    res = AT_send_json_to_url(json, &net_conf);
    AT_handle_result(res, "Error sending JSON to url\n");

    printf("HTTP STATUS: %d\n", *net_conf.http_status_out);

    AT_scene_destroy(scene);
    AT_simulation_destroy(sim);
    cJSON_Delete(json);
}
