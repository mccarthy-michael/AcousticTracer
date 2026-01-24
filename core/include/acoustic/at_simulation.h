/** \file
    \brief AT_Simulation and related functions
*/

#include "acoustic/at.h"

/** \brief Groups the necessary simulation data.
 */
typedef struct AT_Simulation AT_Simulation;

/** \brief AT_Simulation constructor using defined AT_Settings.

    \param out_simulation Pointer to an empty initialised AT_Simulation.
    \param scene Pointer to the simulation's scene data.
    \param settings Pointer to the simulation settings.

    \retval AT_Result Saves the simulation at the pointer, returning a result
   enum value.
*/
AT_Result AT_simulation_create(AT_Simulation **out_simulation,
                               const AT_Scene *scene,
                               const AT_Settings *settings);

/** \brief Destroys an allocated AT_Simulation

    \param simulation Pointer to the simulation data.

    \retval void
*/
void AT_simulation_destroy(AT_Simulation *simulation);

/** \brief Starts the simulation.

    \param simulation Pointer to the simulation.

    \retval AT_Result A result enum value which must be checked for errors.
*/
AT_Result AT_simulation_run(AT_Simulation *simulation);
