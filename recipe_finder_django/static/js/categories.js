let appetizerbtn=document.getElementById("appetizer");
let dessertbtn=document.getElementById("dessert");
let mainbtn=document.getElementById("main");

appetizerbtn.onclick=function(){
    let selectedcategory="Appetizer";
    localStorage.setItem("selectedcategory","Appetizer");
    window.location.href="recipesbycategory.html";
}
dessertbtn.onclick=function(){
    let selectedcategory="Dessert";
    localStorage.setItem("selectedcategory",(selectedcategory));
    window.location.href="recipesbycategory.html";
}
mainbtn.onclick=function(){
    let selectedcategory="Main Course";
    localStorage.setItem("selectedcategory",(selectedcategory));
    window.location.href="recipesbycategory.html";
}

