/* 1. create the 3 controllers that organize this app
  - total controller
  - UI controller
  - data controller
*/



//***************** DATA CONTROLLER ******************************//

var dataController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1
    };
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calcTotals = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, id;
      //create new ID
      if (data.allItems[type].length > 0) {
        id = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        id = 0;
      }
      //create new item based on type
      if (type === 'exp') {
        newItem = new Expense(id, des, val);
      } else if (type === 'inc') {
        newItem = new Income(id, des, val);
      } else {
        alert('Error');
      }
      // push into data structure
      data.allItems[type].push(newItem);
      // return results
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids = data.allItems[type].map(function(cur) {
        return cur.id;
      });

      var index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget: function() {
      // 1. calculate the income and expense totals
      calcTotals('inc');
      calcTotals('exp');
      //2. calculate budget
      data.budget = data.totals.inc - data.totals.exp;
      //3. caluclate percentages
      if (data.budget > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1
      };

    },

    calculatePercentages: function() {
      // caluclate percentage of each expense in the array
      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function(){
      var allPercentages = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        percentage: data.percentage,
        income: data.totals.inc,
        expenses: data.totals.exp,
      };
    },

    testing: function() {
      console.log(data);
    }

  };

})();

//***************** UI CONTROLLER ******************************//

var uiController = (function() {

  var formatNumber = function(num, type){
    var numSplit, int, dec;
    // add + and - signs
    // comma separating the thousands
    // 2 decimals places

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];

    if (int.length > 3){
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

  };

  var nodeListForEach = function(list, callback){
    for (var i = 0; i < list.length; i++){
      callback(list[i], i);
    }
  };

  return {
    getInput: function(type, description, value) {
      return {
        type: document.querySelector('.add__type').value,
        description: document.querySelector('.add__description').value,
        value: parseFloat(document.querySelector('.add__value').value)
      };
    },
    addListItem: function(obj, type) {
      var html, newHtml, element;
      // create html string with placeholder text
      if (type === 'inc') {
        element = '.income__list'
        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      } else if (type === 'exp') {
        element = '.expenses__list'
        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      };
      // replace the placeholder text with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
      newHtml = newHtml.replace('%description%', obj.description);
      // insert html into the dom
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID)
      el.parentNode.removeChild(el);

    },

    showBudget: function(obj) {

      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector('.budget__value').textContent = formatNumber(obj.budget, type);
      document.querySelector('.budget__income--value').textContent = formatNumber(obj.income, 'inc');
      document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.expenses, 'exp');
      document.querySelector('.budget__expenses--percentage').textContent = obj.percentage;

      if (obj.percentage > 0) {
        document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + '%';
      } else {
        document.querySelector('.budget__expenses--percentage').textContent = '---';
      };

    },

    changeType : function(){
      var fields = document.querySelectorAll('.add__type' + ',' + '.add__description' + ',' + '.add__value');

      nodeListForEach(fields, function(cur){
        cur.classList.toggle('red-focus');
      });

      document.querySelector('.ion-ios-checkmark-outline').classList.toggle('red');
    },

    displayMonth: function(){

      var now = new Date();
      var year = now.getFullYear();
      var month = now.getMonth();
      var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      document.querySelector('.budget__title--month').textContent = months[month] + ' ' + year;

    },

    displayPercentages: function(percentages){

      var fields = document.querySelectorAll('.item__percentage');

      nodeListForEach(fields, function(cur, index){
        if (percentages[index] > 0){
        cur.textContent = percentages[index] + '%';
      } else {
        cur.textContent = "---";
      }
      });

    },

    clearFields: function() {
      var fields, fieldsArray;
      // select the fields in the document
      fields = document.querySelectorAll('.add__description, .add__value');
      // turn the list into an array
      fieldsArray = Array.prototype.slice.call(fields);
      // set the values to null
      fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });
      // set focus back to the 0 position
      document.querySelector('.add__description').focus();
    }
  };
})();

//***************** TOTAL CONTROLLER ******************************//

var controller = (function(uiCtrl, dataCtrl) {

  var setupEventListeners = function() {
    // 1. create event listeners for click and enter key
    document.querySelector('.add__btn').addEventListener('click', addNewItem);
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        addNewItem();
      }
    });
    document.querySelector('.container').addEventListener('click', deleteItem);
    document.querySelector('.add__type').addEventListener('change', uiCtrl.changeType);
  };

  var updateBudget = function() {
    // 1. calculate the budget
    dataCtrl.calculateBudget();
    // 2. return the budget
    var budget = dataCtrl.getBudget();
    // 3. update the budget UI
    uiCtrl.showBudget(budget);
    console.log(budget);
  };

  var updatePercentages = function() {

    // 1. calculate percentages
    dataCtrl.calculatePercentages();
    //2. read percentages form the data ctrl
    var percentages = dataCtrl.getPercentages();
    //3. update user interface
    uiCtrl.displayPercentages(percentages);
  };

  var addNewItem = function() {
    // 2. read the data from the UI
    var input = uiCtrl.getInput();

    if (input.description !== "" && input.value > 0 && !isNaN(input.value)) {
      // 3. store the new item data in an object
      var newItem = dataCtrl.addItem(input.type, input.description, input.value);
      // 4. update the new item in the UI
      uiCtrl.addListItem(newItem, input.type);
      // 5. Clear fields
      uiCtrl.clearFields();
      // 6. update budget
      updateBudget();
      // 7. update percentages
      updatePercentages();
    };
  };
  var deleteItem = function(event) {

    var itemID, splitId, type, id;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    splitId = itemID.split('-');
    type = splitId[0];
    id = parseInt(splitId[1]);

    if (itemID) {
      // 1. delete the item from the data structure
      dataCtrl.deleteItem(type, id);
      // 2. delete the item from the UI
      uiCtrl.deleteListItem(itemID);
      // 3. update budget & display new budget
      updateBudget();
      // 4. update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log('App is running');
      uiCtrl.showBudget({
        budget: 0,
        percentage: -1,
        income: 0,
        expenses: 0
      });
      setupEventListeners();
      uiCtrl.displayMonth();
    }
  };

})(uiController, dataController);

//***************** APP INIT ******************************//

controller.init();
