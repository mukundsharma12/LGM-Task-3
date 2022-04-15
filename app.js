const express=require("express");
const bodyParser=require("body-parser");
const ejs =require("ejs");
const mongoose =require("mongoose");
const _=require("lodash");
const app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/studentmanageDB");

const studentSchema=new mongoose.Schema({
  id:Number,
  name:String,
  email:String,
  password:String,
  math:Number,
  physics:Number,
  chemistry:Number,
  remarks:String
});

const teacherSchema= new mongoose.Schema({
name:String,
email:String,
password:String,
students:[studentSchema]
});

const Teacher = mongoose.model("Teacher",teacherSchema);

const Student = mongoose.model("Student",studentSchema);


const userArr=[];


app.get("/",function(req,res){
  res.render("home");
});


app.get("/teacher/profile",(req,res)=>{

  userArr.forEach(function(user){
    console.log(user.pass);
      Teacher.findOne({username:user.username,password:user.pass},function(err,founduser){
        if(err){
          console.log(err);
        }else{
          res.render("profile",{
            teacherName:founduser.name,
            teacherEmail:founduser.email
          });
        }
      });
  });

});

app.get("/teacher/studentinfo",(req,res)=>{
  userArr.forEach(function(user){
    Teacher.findOne({username:user.username,password:user.pass},function(err,founduser){
      if(err){
        console.log(err);
      }else{
          res.render("student-info",{
            students:founduser.students
          });
      }
    });
  });

});

app.get("/student/profile",(req,res)=>{

userArr.forEach(function(user){
  Student.findOne({email:user.username,password:user.pass},function(err,founduser){
    if(err){
      console.log(err);
    }else{
      res.render("studentprofile",{
        studentId:founduser.id,
        studentName:founduser.name,
        studentEmail:founduser.email
      })
    }
  });
});
});
app.get("/student/result",(req,res)=>{
userArr.forEach(function(user){
  Student.findOne({email:user.username,password:user.pass},function(err,founduser){
    if(err){
      console.log(err);
    }else{
const mper=((founduser.math/100)*100)+"%";
const pper=((founduser.physics/100)*100) +"%";
const cper=((founduser.chemistry/100)*100) +"%";
const per=(((founduser.math+founduser.physics+founduser.chemistry)/300)*100);
let message="";
if(per>=30 ){
  message="Pass";
}else{
  message="Fail";
}
        res.render("result",{
          mathsmarks:founduser.math,
          mper:mper,
          physicsmarks:founduser.physics,
          pper:pper,
          chemistrymarks:founduser.physics,
          cper:cper,
          totalpercentage:per+"%",
          message:message,
          remarks:founduser.remarks
        });
    }
  })
})

});

app.get("/login/:designation",function(req,res){
  const desig=req.params.designation
const display=_.capitalize(req.params.designation);
  res.render("login",{
    design:desig,
    designdisplay:display
  });

});
app.get("/logout",function(req,res){
  userArr.pop();
  res.redirect("/");
})
app.post("/:designation/profile",(req,res)=>{
  const designation=req.params.designation;
  const username=req.body.username;
  const pass=req.body.password;
userArr.push({
  username:req.body.username,
  pass:req.body.password
});
  if(designation==="teacher"){
    Teacher.findOne({email:username,password:pass},function(err,user){
      if(err){
        console.log(err)
      }else{
      /*console.log(user.email);*/
      res.render("profile",{
        teacherName: user.name,
        teacherEmail:user.email
      });
      }
    })
  }else if(designation==="student"){
    Student.findOne({email:username,password:pass},function(err,user){
      if(err){
        console.log(err);
      }else{
        console.log(user.id);
        res.render("studentprofile",{
          studentId:user.id,
          studentName:user.name,
          studentEmail:user.email
        })
      }
    });
    console.log("Student");
  }
});

app.post("/teacher/studentinfo",function(req,res){
  const cId=req.body.candidateId;
  const cName=req.body.candidateName;
  const cEmail=req.body.candidateEmail;
  let stuId="";
  let teachId="";
  console.log(cId);
    const mMarks=req.body.mathsmarks;
      const pMarks=req.body.physicsmarks;
        const cMarks=req.body.chemistrymarks;
        const remarks=req.body.remarks;
        Student.findOne({name:cName,email:cEmail},function(err,user){
          if(err){
            console.log(err);
          }else{
            stuId=user._id;
            console.log(stuId);
            Student.updateOne({_id:user._id},{math:mMarks,physics:pMarks,chemistry:cMarks,remarks:remarks},function(err){
                if(err){
                  console.log(err);
                }else{
                  console.log("Updated");
                }
              });

          }
        });
        userArr.forEach(function(user){
          teachId=user.username;
        })
        console.log(teachId);
        Teacher.findOne({email:teachId},function(err,founduser){
          if(err){
            console.log(err);
          }else{

          Teacher.updateOne({_id:founduser._id,"students._id":stuId},{$set:{
            "students.$.math":mMarks,
            "students.$.physics":pMarks,
            "students.$.chemistry":cMarks,
            "students.$.remarks":remarks
          }},function(err){
            if(err){
              console.log(err);
            }else{
              console.log("arr updated");
              res.redirect("/teacher/studentinfo");
            }
          });
          }
        })



})


app.listen(process.env.PORT||3000,()=>{
  console.log("server started at port 3000");
});
