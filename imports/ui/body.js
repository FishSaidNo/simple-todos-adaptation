import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Tasks } from '../api/tasks.js';

import './task.js';
import './body.html';

Template.body.onCreated(function bodyOnCreated() {
    this.state = new ReactiveDict();
    Meteor.subscribe('tasks');

    //Prevent form text fields being submitted with Enter key
    $(document).on('keyup keypress', 'form input[type="text"]', function(e) {
        if(e.keyCode == 13) {
            e.preventDefault();
            return false;
        }

    });
});

Template.body.helpers({
    tasks() {
        const instance = Template.instance();
        if (instance.state.get('hideCompleted')) {
            // If hide completed is checked, filter tasks
            return Tasks.find({ checked: { $ne: true } }, { sort: { createdAt: -1 } });
        }
        // Otherwise, return all of the tasks
        return Tasks.find({}, { sort: { createdAt: -1 } }); // Show newest tasks at the top
    },
    incompleteCount() {
        return Tasks.find({ checked: { $ne: true } }).count();
    },
});

Template.body.events({
    'submit .new-task'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const make = target.children.make.value;
        const model = target.children.model.value;
        const year = target.children.year.value;

        // Insert a task into the collection
        Meteor.call('tasks.insert', make, model, year);

        // Clear form
        $(target).trigger('reset');
    },
    'change .hide-completed input'(event, instance) {
        instance.state.set('hideCompleted', event.target.checked);
        // console.log(instance.state);
        // console.log(Meteor.user());
    },
});