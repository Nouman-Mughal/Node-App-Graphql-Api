// import { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLSchema, GraphQLList, GraphQLNonNull } from 'graphql/type';
const {GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLSchema, GraphQLList, GraphQLNonNull }=require('graphql/type')
// import ToDoMongo from '../../mongoose/todo'
const ToDoMongo=require('../../mongoose/todo')

/**
 * generate projection object for mongoose
 * @param  {Object} fieldASTs
 * @return {Project}
 */
exports.getProjection= function  (fieldASTs) {
  return fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
    projections[selection.name.value] = true;
    return projections;
  }, {});
}

var todoType = new GraphQLObjectType({
  name: 'todo',
  description: 'todo item',
  fields: () => ({
    itemId: {
      type: (GraphQLInt),
      description: 'The id of the todo.',
    },
    item: {
      type: GraphQLString,
      description: 'The name of the todo.',
    },
    completed: {
      type: GraphQLBoolean,
      description: 'Completed todo? '
    }
  })
});

var schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      todo: {
        type: new GraphQLList(todoType),
        args: {
          itemId: {
            name: 'itemId',
            type: new GraphQLNonNull(GraphQLInt)
          }
        },
        resolve: (root, {itemId}, source, fieldASTs) => {
          var projections = getProjection(fieldASTs);
          var foundItems = new Promise((resolve, reject) => {
              ToDoMongo.find({itemId}, projections,(err, todos) => {
                  err ? reject(err) : resolve(todos)
              })
          })

          return foundItems
        }
      }
    }
  })
  
});

module.exports=schema;

