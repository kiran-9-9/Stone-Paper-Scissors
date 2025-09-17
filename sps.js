let userscore=0;
let compscore=0;

const choices=document.querySelectorAll(".choice");
const msg=document.querySelector(".msg")
const scoreboard=document.querySelector(".scoreboard")
const Userscorepara=document.querySelector(".user-score")
const Compscorepara=document.querySelector(".comp-score");

const gencompchoice=()=>{
    const options=["rock","paper","scissors"];
    const randind=Math.floor(Math.random()*3);
    return options[randind];
}
const draw=()=>{
    console.log("game was draw");
    msg.innerText=`game draw`;
}
const showwinner=(userwin,userchoice,compchoice)=>{
    if(userwin){
         
        Userscorepara.innerText=userscore=userscore+1;
        console.log("userscore=",userscore);
        msg.innerText=`you won !, your choice "${userchoice}" beats "${compchoice}"`; 

    }else{
        Compscorepara.innerText=compscore=compscore+1;
        console.log("you lose");
        msg.innerText=`you lose, compchoice "${compchoice}" beats your choice "${userchoice}"`
    }
    
}
const playgame=(userchoice)=>{
    console.log("userchoice is=",userchoice);
    const compchoice=gencompchoice();
    console.log("computer choice is=",compchoice);

    if(userchoice===compchoice){
        draw();
    }
    else
    {
        let userwin=true;
         if(userchoice==="rock")
        {
            //comp choice may be paper or scissors
           userwin= compchoice==="paper"?false:true;
        }
        else if(userchoice==="paper")
        {
            //comp choice may be scissors | rock
            userwin=compchoice==="scissors"?false:true;
        }
        else 
        {
            //comp choice may be rock | paper
            userwin=compchoice==="rock"?false:true; 
        }
        showwinner(userwin,userchoice,compchoice);
    }
 
};
choices.forEach((choice)=>{
    // console.log(choice);
    choice.addEventListener("click",()=>{
        const userchoice=choice.getAttribute("id");
        // console.log("choice was clicked",userchoice);
        playgame(userchoice);
    })
});

const rebtn=document.querySelector("#reset");
rebtn.addEventListener("click",()=>{
    Userscorepara.innerText="0";
    Compscorepara.innerText="0";
})
