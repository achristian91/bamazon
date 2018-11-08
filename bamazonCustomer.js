var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host:"localhost",
    port:3306,
    user:"root",
    password:"",
    database:"bamazon"
})

connection.connect(function(err){
    if (err) throw err;
    makeTable();
})

var makeTable = function(){
    connection.query("SELECT * FROM products", function(err,res){
        for(var i=0; i<res.length; i++){
            console.log(res[i].itemid+" || "+res[i].productname+" || "+res[i].departmentname+" || "+res[i].price+" || "+res[i].stockquantity+"\n");
        }
    promptCustomer(res);
    })
}

var promptCustomer = function(res){
    inquirer.prompt([{
        type:'input',
        name: "choice",
        message:"What is the ID of the product you would like to buy? [Finish with D]"
    }]).then(function(answer){
        var connect = false;
        if(answer.choice.toUpperCase()=="D"){
            process.exit();
        }
        for(var i=0;i<res.length;i++){
            if(res[i].productname==answer.choice){
                correct=true;
                var product=answer.choice;
                var id=i;
                inquirer.prompt({
                    type:"input",
                    name:"quant",
                    message:"How many units would you like to buy?",
                    validate: function(value){
                        if(isNaN(value)==false){
                            return true;
                        } else {
                            return false;
                        }
                    }
                }).then(function(answer){
                    if((res[id].stockquantity-answer.quant)>0){
                        connection.query("UPDATE products SET stockquantity='"+(res[id].stockquantity-answer.quant)+"' WHERE productname='"+product+"'", function(err,res2){
                            console.log("Product Brought!");
                            makeTable();
                        })
                    } else {
                        console.log("Insufficient quantity!");
                        promptCustomer(res);
                    }
                })
            }
        }
        if(i==res.length && correct==false){
            console.log("Not a valid selection!");
            promptCustomer(res);
        }
    })
}