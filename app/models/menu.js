exports.definition = {
  config: {
    columns: {
      id: 'Number',
      name: 'String',
      icon: 'String'
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
