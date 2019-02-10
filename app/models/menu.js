exports.definition = {
  config: {
    columns: {
      id: 'Number',
      name: 'String',
      label: 'String',
      path: 'String',
      icon: 'String',
      category: 'String'
    },
    default: {},
    adapter: {
      collection_name: 'menu'
    }
  },
  extendModel: function (Model) {
    _.extend(Model.prototype, {
      // extended functions and properties go here
    });

    return Model;
  },
  extendCollection: function (Collection) {
    _.extend(Collection.prototype, {});

    return Collection;
  }
};
