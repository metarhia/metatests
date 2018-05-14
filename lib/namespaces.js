'use strict';

module.exports = (metatests) => {

  metatests.namespaces = [];

  metatests.namespace = (namespace) => {
    metatests.namespaces.push(namespace);
  };

};
