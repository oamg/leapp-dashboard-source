// import Dolor from './pages/Dolor';
import Actors from './pages/Actors';
import Models from './pages/Models';
import Tags from './pages/Tags';
import Topics from './pages/Topics';
import Workflows from './pages/Workflows';

const baseName = '/';

const routes = () => [
  /*  {
    iconClass: 'fa fa-dashboard',
    title: 'Ipsum',
    to: '/',
    component: Ipsum,
    subItems: [
      {
        iconClass: 'fa fa-envelope-open',
        title: 'Item 1-A',
        to: '/ipsum/item-1-A',
        component: Ipsum1A
      },
      {
        iconClass: 'fa fa-envelope-closed',
        title: 'Item 1-B',
        to: '/ipsum/item-1-B',
        component: Ipsum1B
      }
    ]
  }, */
  {
    iconClass: 'fa fa-star',
    title: 'Actors',
    to: '/',
    component: Actors
  },
  {
    iconClass: 'fa fa-sitemap',
    title: 'Models',
    to: '/models',
    component: Models
  },
  {
    iconClass: 'fa fa-tags',
    title: 'Tags',
    to: '/tags',
    component: Tags
  },
  {
    iconClass: 'fa fa-book',
    title: 'Topics',
    to: '/topics',
    component: Topics
  },
  {
    iconClass: 'fa fa-code-fork',
    title: 'Workflows',
    to: '/workflows',
    component: Workflows
  } /* ,
  {
    iconClass: 'fa fa-comments',
    title: 'Messages',
    to: '/messages',
    component: Dolor
  },
  {
    iconClass: 'fa fa-file-text',
    title: 'Logs',
    to: '/logs',
    component: Dolor
  } */
];

export { baseName, routes };
