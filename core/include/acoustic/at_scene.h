/** \file
    \brief AT_Scene and related functions
*/

#ifndef AT_SCENE_H
#define AT_SCENE_H

#include "at.h"

/** \brief Groups the necessary information representing the scene.
 */
typedef struct AT_Scene AT_Scene;

/** \brief AT_Scene constructor for a given AT_SceneConfig.
    \relates AT_Scene

    \param out_scene Pointer to an emtpy initialised AT_Scene.
    \param config Pointer to the scene's config.

    \retval AT_Result Saves the created scene at the location of the pointer,
   returning a result enum value.
*/
AT_Result AT_scene_create(AT_Scene **out_scene, const AT_SceneConfig* config);

/** \brief Destroys an allocated AT_Scene.

    \param scene Pointer to an initialised AT_Scene.

    \retval void
*/
void AT_scene_destroy(AT_Scene *scene);

#endif // AT_SCENE_H
