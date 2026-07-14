import { createRouter, createWebHistory } from 'vue-router'

import KeyMessageExtraction from '../pages/KeyMessageExtraction.vue'
import StanceDetection       from '../pages/StanceDetection.vue'
import TitleGeneration       from '../pages/TitleGeneration.vue'
import Experiments           from '../pages/Experiments.vue'
import EvaluationOverview    from '../pages/EvaluationOverview.vue'
import ContributionList      from '../pages/ContributionList.vue'
import ContributionDetail    from '../pages/ContributionDetail.vue'
import Settings              from '../pages/Settings.vue'

const routes = [
  { path: '/',                                    redirect: '/evaluation' },
  // Evaluation
  { path: '/evaluation',                          component: EvaluationOverview, name: 'evaluation' },
  { path: '/evaluation/contributions',            component: ContributionList,   name: 'contribution-list' },
  { path: '/evaluation/contributions/:id',        component: ContributionDetail, name: 'contribution-detail' },
  // Analysis (existing pages)
  { path: '/key-message-extraction',              component: KeyMessageExtraction, name: 'key-message-extraction' },
  { path: '/stance-detection',                    component: StanceDetection,      name: 'stance-detection' },
  { path: '/title-generation',                    component: TitleGeneration,      name: 'title-generation' },
  { path: '/experiments',                         component: Experiments,          name: 'experiments' },
  // Settings
  { path: '/settings',                            component: Settings,             name: 'settings' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
