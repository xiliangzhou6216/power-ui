import { ComponentDoc, CheckboxDoc, ButtonDoc, RadioDoc } from '@/view/component';
import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '@/view/home';
export default createRouter({
  history: createWebHashHistory(''),
  routes: [
    {
      path: '/',
      component: Home,
    }, {
      path: '/component',
      name: 'component',
      component: ComponentDoc,
      children: [
        {
          path: 'button',
          name: 'button',
          component: ButtonDoc
        }, {
          path: 'checkbox',
          name: 'checkbox',
          component: CheckboxDoc
        }, {
          path: 'radio',
          name: 'radio',
          component: RadioDoc
        }
      ]
    }
  ],
});
