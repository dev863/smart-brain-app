import React, {Component} from 'react';
import Particle from './Component/Particle/Particle';
import FaceRecognition from './Component/FaceRecognition/FaceRecognition'
import Navigation from './Component/Navigation/Navigation';
import './App.css';
import Register from  './Component/Register/Register';
import SignIn from './Component/SignIn/SignIn';
import Logo from './Component/Logo/Logo';
import ImageLinkForm from './Component/ImageLinkForm/ImageLinkForm';
import Rank from './Component/Rank/Rank';
/*import Clarifai from 'clarifai';
const app= new Clarifai.App({
    apiKey:'79ad45a83935498d89481a3cb7e78a77',
})*/

///////////////////////////////////////////////////////////////////////////////////////////////////
// In this section, we set the user authentication, user and app ID, model details, and the URL
// of the image we want as an input. Change these strings to run your own example.
//////////////////////////////////////////////////////////////////////////////////////////////////

// Your PAT (Personal Access Token) can be found in the portal under Authentification
const PAT = 'ab5136170f2c4ab2a1b16846a9846651';
// Specify the correct user_id/app_id pairings
// Since you're making inferences outside your app's scope
const USER_ID = '8ssa4r9uc9xf';       
const APP_ID = 'test';
// Change these to whatever model and image URL you want to use
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105';    


///////////////////////////////////////////////////////////////////////////////////
// YOU DO NOT NEED TO CHANGE ANYTHING BELOW THIS LINE TO RUN THIS EXAMPLE
///////////////////////////////////////////////////////////////////////////////////





// NOTE: MODEL_VERSION_ID is optional, you can also call prediction with the MODEL_ID only
// https://api.clarifai.com/v2/models/{YOUR_MODEL_ID}/outputs
// this will default to the latest version_id



class App extends Component {
    
        constructor()
        {
            super();
            this.state = {
                input: '',
                imageUrl:'',
                box:{},
                route:'signin',
                isSignedIn:false,
                user:{
                    id:'',
                    name:'',
                    email:'',
                    entries:0,
                    joined:''
                }
            };
        }
      
        loadUser = (data) =>{
            this.setState({user: {
                    id:data.id,
                    name:data.name,
                    email:data.email,
                    entries:data.entries,
                    joined:data.joined
            }})
        }
        calculateFaceLocation = (data1) => {
            const clarifaiFace = data1.outputs[0].data.regions[0].region_info.bounding_box;
            console.log(clarifaiFace);
            const image = document.getElementById('inputimage');
            const width=Number(image.width);
            const height=Number(image.height);
            //console.log(clarifaiFace.left_col,width);
            return{
                leftCol:clarifaiFace.left_col*width,
                topRow:clarifaiFace.top_row*height,
                rightCol:width-(clarifaiFace.right_col*width),
                bottomRow: height - (clarifaiFace.bottom_row*height)
            }
        } 
        displayFaceBox = (box) => {
           
            this.setState({box:box});
        }
        onInputChange= (event) =>
        {
            this.setState({input:event.target.value});
        }
       
        onButtonSubmit = () =>
        {
            this.setState({imageUrl:this.state.input});
            console.log(this.state.user.name);
            
        const raw = JSON.stringify({
            "user_app_id": {
                "user_id": USER_ID,
                "app_id": APP_ID
            },
            "inputs": [
                {
                    "data": {
                        "image": {
                            "url": this.state.input
                        }
                    }
                }
            ]
        });
        const requestOptions = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Key ' + PAT
            },
            body: raw
        };
        fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs" , requestOptions)
    .then(response=> response.json())
    .then(result =>{ 
        if(result){
            console.log('hello');
            console.log('email'+this.state.user.email);
            fetch('http://localhost:3000/image', {
                method:'put',
                headers:{'Content-Type':'application/json'},
                body: JSON.stringify({
                    id:this.state.user.id,
                    
            })
            })
            .then(response => response.json())
            .then(count=> {
                console.log(count);
                this.setState(Object.assign(this.state.user,{entries:count}))
            })
            
        }
        this.displayFaceBox(this.calculateFaceLocation(result))})
    .catch(error => console.log('error', error));

        }
        onRouteChange= (route) =>
        {   if(route === 'signout')
            {
            this.setState({isSignedIn: false});
            }else if(route === 'home')
            {
                this.setState({isSignedIn:true})
            }
            this.setState({route:route});
        }
        render(){
        return (
            <div className="App">
                    <Particle className="particle" />
                    <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
                    {this.state.route === 'home'?
                    
                    <div>
                    <Logo />
                    <Rank name={this.state.user.name} entries={this.state.user.entries}/>
                    <ImageLinkForm  onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
                    
                    <FaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
                    </div>
                    :(
                        this.state.route === 'signin'?
                        <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                        :<Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> 
                    )
        }
            </div>
);
        }
            

}
export default App;
