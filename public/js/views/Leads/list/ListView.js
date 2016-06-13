define([
    'jQuery',
    'Underscore',
    'views/listViewBase',
    'text!templates/Leads/list/ListHeader.html',
    'text!templates/stages.html',
    'views/Leads/CreateView',
    'views/Leads/list/ListItemView',
    'views/Leads/EditView',
    'views/Filter/filterView',
    'models/LeadsModel',
    'collections/Leads/filterCollection',
    'common',
    'constants'
], function ($,
             _,
             listViewBase,
             listTemplate,
             stagesTemplate,
             CreateView,
             ListItemView,
             EditView,
             FilterView,
             CurrentModel,
             contentCollection,
             common,
             CONSTANTS) {
    'use strict';

    var LeadsListView = listViewBase.extend({
        createView              : CreateView,
        listTemplate            : listTemplate,
        ListItemView            : ListItemView,
        contentCollection       : contentCollection,
        FilterView              : FilterView,
        totalCollectionLengthUrl: '/leads/totalCollectionLength',
        formUrl                 : '#easyErp/Leads/form/',
        contentType             : CONSTANTS.LEADS,

        events: {
            'click .stageSelect'          : 'showNewSelect',
            'click .newSelectList li'     : 'chooseOption',
            'click .list td:not(.notForm)': 'goToEditDialog',
            'click #convertToOpportunity' : 'openDialog'
        },

        initialize: function (options) {
            $(document).off('click');

            this.EditView = EditView;
            this.CreateView = CreateView;

            this.startTime = options.startTime;
            this.collection = options.collection;
            this.parrentContentId = options.collection.parrentContentId;
            this.sort = options.sort;
            this.filter = options.filter;
            this.page = options.collection.currentPage;
            this.contentCollection = contentCollection;
            this.stages = [];

            this.render();
        },

        chooseOption: function (e) {
            var self = this;
            var target$ = $(e.target);
            var targetElement = target$.parents('td');
            var id = targetElement.attr('id');
            var model = this.collection.get(id);

            model.save({workflow: target$.attr('id')}, {
                headers: {
                    mid: 24
                },
                patch  : true,
                success: function () {
                    self.showFilteredPage(self.filter, self);
                }
            });

            this.hideNewSelect();
            return false;
        },

        pushStages: function (stages) {
            this.stages = stages;
        },

        openDialog: function () {
            $('#dialog-form').dialog('open');
        },

        render: function () {
            var self = this;
            var $currentEl;
            var itemView;

            $('.ui-dialog ').remove();

            $currentEl = this.$el;

            $currentEl.html('');
            $currentEl.append(_.template(listTemplate));

            itemView = new this.ListItemView({
                collection : this.collection,
                page       : this.page,
                itemsNumber: this.collection.namberToShow
            });

            itemView.bind('incomingStages', this.pushStages, this);

            common.populateWorkflowsList('Leads', '.filter-check-list', '', '/Workflows', null, function (stages) {
                self.stages = (self.filter) ? self.filter.workflow : null;
                itemView.trigger('incomingStages', stages);
            });

            $currentEl.append(itemView.render());
            
            this.renderFilter();

            this.renderPagination($currentEl, this);

            $currentEl.append("<div id='timeRecivingDataFromServer'>Created in " + (new Date() - this.startTime) + ' ms</div>');
        },

        hideNewSelect: function () {
            $('.newSelectList').remove();
        },

        showNewSelect: function (e) {
            if ($('.newSelectList').is(':visible')) {
                this.hideNewSelect();
                return false;
            }
            $(e.target).parent().append(_.template(stagesTemplate, {stagesCollection: this.stages}));
            return false;
        },

        goToEditDialog: function (e) {
            var id;
            var currentModel;

            e.preventDefault();

            id = $(e.target).closest('tr').data('id');
            currentModel = new CurrentModel({validate: false});
            currentModel.urlRoot = CONSTANTS.URLS.LEADS;
            currentModel.fetch({
                data: {
                    id      : id,
                    viewType: 'form'
                },

                success: function (model) {
                    new EditView({model: model});
                },

                error: function () {
                    App.render({
                        type   : 'error',
                        message: 'Please refresh browser'
                    });
                }
            });
        }
    });

    return LeadsListView;
});
