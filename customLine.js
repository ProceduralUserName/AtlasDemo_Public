fabric.CustomLine = fabric.util.createClass(fabric.Line, {
    type: 'customLine',

    initialize: function(points, options) {
        options || (options = {});
        this.callSuper('initialize', points, options);
        this.set('displayLength', options.displayLength || 0);
        this.set('material', options.material || 0);
    },

    toObject: function() {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            displayLength: this.get('displayLength')
        });
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
        // Additional rendering logic if needed
    }
});

fabric.CustomLine.fromObject = function(object, callback) {
    return fabric.Object._fromObject('CustomLine', object, callback, 'points');
};
