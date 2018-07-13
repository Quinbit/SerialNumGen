document.getElementById('getSerial').addEventListener('click', getSerialButton);

function processData(data) {
  //initial processing of data and adding of options
  localStorage.setItem('csv', data);
  reloadTable();
}

function initialize () {
  $(document).ready(function() {
      $.ajax({
          type: "GET",
          url: "data.csv",
          dataType: "text",
          success: function(data) {processData(data);}
       });
  });

  serial = document.getElementById("Serial Number");
  serial.style.visibility = "hidden";
}

function reloadTable() {
  var form = document.getElementById('mainForm');
  var toaddstring = '';
  var item = document.getElementById('product');
  var selectedText = $(":selected",item).text();
  var number;
  if (document.getElementById('productNum') != undefined) {
    number = document.getElementById('productNum').value;
  }
  else {
    number = '';
  }
  var index;
  var featureList = [];
  var productKey;
  var featureToCode = {};
  var data = parseData(localStorage.getItem('csv'));
  console.log(data);

  if ((selectedText == '') || (selectedText == undefined)) {
    index = 0;
    while (data[index][0].replace(' ','').replace(' ','').replace(' ','') != 'Product') {
      index += 1;
    }

    selectedText = data[index][1];
  }
  console.log(selectedText);
  //console.log(JSON.stringify(data));

  index = 0;
  //get index of element in csv
  for (i=0; i < data.length; i++) {
    if ((data[i].length > 2) && (data[i][0] != '') && (data[i][0] != undefined)) {
      if (data[i][1] == selectedText) {
        index = i;
        break;
      }
    }
  }
  console.log(index);
  //get product key
  index += 1;

  while (data[index][0] == "") {
    index = index + 1;
  }

  productKey = data[index][1];
  console.log(productKey);
  localStorage.setItem("productKey", productKey)

  index += 1;

  while (data[index][0] == "") {
    index = index + 1;
  }

  //get the other product defining categories
  for (i=1; i < data.length; i += 2) {
    if ((data[index][i] != "") && (data[index][i] != undefined)) {
      featureList.push([i, data[index][i]]);
    }
  }

  localStorage.setItem('featureList', JSON.stringify(featureList));

  toaddstring += '<div class="form-group">';
  for (i=0; i < featureList.length; i++) {
    featureToCode[featureList[i][1]] = {};
    toaddstring += '<label for="' + featureList[i][1] +  '">' + featureList[i][1] + "</label>" +
      '<select class="form-control" id="' + featureList[i][1] + '">';

     var temp = index + 1;

     while (data[temp][featureList[i][0]] == '') {
       temp += 1;
     }

     var code;
     while ((data[temp][featureList[i][0]] != '') && (data[temp][featureList[i][0]] != undefined)) {
       var string = data[temp][featureList[i][0]];

       if (data[index][featureList[i][0]].toLowerCase().replace(' ','').replace(' ','').replace(' ','') != 'year') {
         code = data[temp][featureList[i][0] + 1];
       }
       else {
         code = '-' + data[temp][featureList[i][0]];
         console.log('year')
       }

       featureToCode[featureList[i][1]][string] = code.replace(' ','').replace(' ','').replace(' ','');

       toaddstring += '<option value="' + string + '">' + string + '</option>';
       temp += 1;
     }

     toaddstring += '</select>';
  }

  toaddstring += "</div>";

  localStorage.setItem('code', JSON.stringify(featureToCode));

  var prevhtml = '<div class="form-group">' +
    '<label for="product">Select Product</label>' +
     '<select class="form-control" id="product" onchange="reloadTable()">';

  for (i=0; i< data.length; i++) {
    if (data[i][0].replace(' ','').replace(' ','').replace(' ','') == 'Product') {
      if (data[i][1] == selectedText) {
        prevhtml += '<option value="' + data[i][1] + '" selected="selected">' + data[i][1] + '</option>';
      }
      else {
        prevhtml += '<option value="' + data[i][1] + '">' + data[i][1] + '</option>';
      }
    }
  }

  prevhtml += '</select>' + '</div>';

  prevhtml += '<div class="form-group">' +
    '<label for="productNum">Product Number in Series (with leading zeroes)</label>' +
    '<input type="text" class="form-control" placeholder="ex. 01" id="productNum" value="' + number + '">'
  '</div>';

  form.innerHTML = prevhtml + toaddstring;
  //processData(data);
  //console.log(prevhtml + toaddstring);
}

function getSerialButton() {
  var finalSerial = '';
  var number;
  var featureToCode = JSON.parse(localStorage.getItem('code'));
  var featureList = JSON.parse(localStorage.getItem('featureList'));
  console.log(featureList)
  console.log(featureToCode);
  if (document.getElementById('productNum') != undefined) {
    number = document.getElementById('productNum').value;
  }
  else {
    number = '';
  }

  productKey = localStorage.getItem('productKey');

  finalSerial += productKey.replace(' ','').replace(' ','').replace(' ','') + "-";
  finalSerial += number;
  var acrylic = false;

  for (var i = 0; i < featureList.length; i++) {
    selector = document.getElementById(featureList[i][1]);
    var key = $(":selected",selector).text();
    if (key.toLowerCase().includes("acrylic")) {
      acrylic = true;
    }
  }

  for (var i = 0; i < featureList.length; i++) {
    selector = document.getElementById(featureList[i][1]);
    var key = $(":selected",selector).text();
    if (!acrylic || !featureList[i][1].toLowerCase().includes("finishes")) {
      finalSerial += featureToCode[featureList[i][1]][key];
    }
  }

  console.log(finalSerial);

  block = document.getElementById('Serial Number');
  block.style.visibility = "visible";
  block.textContent = finalSerial;
}

function parseData(data) {
  data = data.replace(' ', '');
  data = data.split('\r');
  for (i = 0; i < data.length; i++) {
    data[i] = data[i].split(',');
  }

  return data;
}
