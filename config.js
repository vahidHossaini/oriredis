module.exports = class defaultConfig
{
    constructor(config)
    { 
         
    }
    getPackages()
    {
       return []
    }
    getMessage()
	{
		return{
			default001:"user not exist", 
		}
	}
    getVersionedPackages()
    { 
      return []
    }
    getDefaultConfig()
    {
      return 
	  {
		connectons :[
			{
				name:"context1",
				host:"",
				port:6037,
				db:0,
				username:"",
				password:""
				
			}
		]
      }
    }
}