var uuid=require("uuid");
var redis=require("redis");
class RedisRouting
{
	constructor(disc)
	{
		this.disc=disc
	}
	Expire(context,key,value,func)
	{
		if(value)
		{
			return this.disc.run('redis','expireKey',{context,name:key,value},func);
		}
		return this.disc.run('redis','deleteKey',{context,name:key},func);
	}
	Increment(context,key,value,func)
	{ 
		return this.disc.run('redis','increment',{context,name:key,value},func);
	}
	Exist(context,key,func)
	{ 
		return this.disc.run('redis','existKey',{context,name:key},func);
	}
	GetArray(context,key,from,to,func)
	{
		return this.disc.run('redis','getArray',{context,name:key,from,to},func);
	}
	AddUnique(context,key,value,func)
	{
		return this.disc.run('redis','arrayAddUnique',{context,name:key,value},func);
	}
	ArrayLength(context,key,func)
	{
		return this.disc.run('redis','arrayLength',{context,name:key},func);
	}
	AddToArray(context,key,index,value,force,func)
	{  
		if(index=='start')
		{
			return this.disc.run('redis','arrayAddStart',{context,name:key,value,force},func);
		}
		if(index=='end')
		{
			return this.disc.run('redis','arrayAddEnd',{context,name:key,value,force},func);
		}
		return this.disc.run('redis','arrayAddIndex',{context,name:key,value,index},func); 
	} 
	GetValue(context,key,isObject,func)
	{
		if(isObject)
		{
			if(Array.isArray(key))
				return this.disc.run('redis','getObjects',{context,names:key},func);
			else
				return this.disc.run('redis','getObject',{context,name:key},func);
		}
		else
		{
			if(Array.isArray(key))
				return this.disc.run('redis','getValues',{context,names:key},func);
			else
				return this.disc.run('redis','getValue',{context,name:key},func);
		}
	}
	SetValue(context,key,value,func)
	{
		if(typeof(value)=="object")
		{
			return this.disc.run('redis','setObject',{context,name:key,value},func);
		}
		else
		{
			return this.disc.run('redis','setValue',{context,name:key,value},func);
		}
	}
	
}
module.exports = class defaultIndex
{
	createConnection(con)
	{ 
		var conf={
			port:6379,
			host:'localhost',
			db:0
		};
		if(con.port)conf.port=con.port
		if(con.host)conf.host=con.host
		if(con.db)conf.db=con.db
		
		var c = redis.createClient(conf.port, conf.host);
		c.on('connect', function() {
			console.log('Redis -> redis connected '+conf.host);
		});
		c.select(conf.db, function(err,res){
			console.log('Redis -> redis on db : '+conf.db);
		});
		this.context[con.name]=c
	}
	constructor(config,dist)
	{
		this.context={};
		this.config=config.statics; 
		//console.log(config)
		for(var a of this.config.connections)
		{
			this.createConnection(a);
		}
		global.redis = new RedisRouting(dist);
		
	}
	
	async getArray(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		if((!dt.from && dt.from!=0) || (!dt.to && dt.to!=0))
			return func({m:"redis002"}) 
		
			self.context[dt.context].lrange(dt.name,dt.from,dt.to,(err,data)=>{				
				return func(err,data);
			}); 
	}
	async arrayAddIndex(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		if(!dt.value)
			return func({m:"redis002"}) 
		
			self.context[dt.context].lset(dt.name,dt.index,dt.value,(err,data)=>{				
				return func(err,data);
			}); 
	}
	async arrayAddEnd(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		if(!dt.value)
			return func({m:"redis002"}) 
		
		if(dt.force)
		{
			self.context[dt.context].rpush(dt.name,dt.value,(err,data)=>{				
				return func(err,data);
			});
		}
		else
		{
			self.context[dt.context].rpushx(dt.name,dt.value,(err,data)=>{				
				return func(err,data);
			}); 
		}
	}
	async arrayAddStart(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		if(!dt.value)
			return func({m:"redis002"}) 
		if(dt.force)
		{
			self.context[dt.context].lpush(dt.name,dt.value,(err,data)=>{				
				return func(err,data);
			});
		}
		else
		{
			self.context[dt.context].lpushx(dt.name,dt.value,(err,data)=>{				
				return func(err,data);
			}); 
		}
	}
	async arrayAddUnique(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"}) 
		self.context[dt.context].sadd(dt.name,dt.value,(err,data)=>{
			
			return func(err,data);
		}); 
	}
	async arrayLength(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"}) 
		self.context[dt.context].llen(dt.name,(err,data)=>{
			
			return func(err,data);
		}); 
	}
	
	async expireKey(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		self.context[dt.context].expire(dt.name,dt.value,(err,data)=>{
			
			return func(err,data);
		}); 
	}
	async deleteKey(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"}) 
		self.context[dt.context].del(dt.name,(err,data)=>{
			
			return func(err,data);
		}); 
	}
	async existKey(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		self.context[dt.context].exists(dt.name,(err,data)=>{
			
			return func(err,data);
		}); 
	}
	
	
	async increment(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"}) 
		if(dt.value)
		{
			self.context[dt.context].incrby(dt.name,dt.value,(err,data)=>{
				
				return func(err,data);
			}); 
		}
		else
		{
			self.context[dt.context].incr(dt.name,(err,data)=>{
				
				return func(err,data);
			}); 
		}
	}
	
	async setValue(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		self.context[dt.context].set(dt.name,dt.value,(err,data)=>{
			
			return func(err,data);
		}); 
	}
	async getValue(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		self.context[dt.context].get(dt.name,(err,data)=>{
			
			return func(err,data);
		}); 
	}
	async getValues(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		self.context[dt.context].mget(dt.names,(err,data)=>{
			
			return func(err,data);
		}); 
	}
	async setObject(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		self.context[dt.context].set(dt.name,JSON.stringify(dt.value) ,(err,data)=>{
			
			return func(err, data);
		}); 
	}
	async getObject(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		self.context[dt.context].get(dt.name ,(err,data)=>{
				console.log(err,data)
			if(data)
				try{
					return func(err, JSON.parse(data));
					
				}catch(exp)
				{
					return func({m:"redis003",data} );
				}
			return func(err, data);
		}); 
	}
	async getObjects(msg,func,self)
	{
		var dt=msg; 
		if(!self.context[dt.context])
			return func({m:"redis001"})
		self.context[dt.context].get(dt.name ,(err,data)=>{
			var obj=[]
			for(var a of data)
			{
				if(a)
					try{
						obj.push(JSON.parse(a))
						
					}catch(exp)
					{
						return func({m:"redis003",data:a} );
					}
				else
					obj.push(null)
			} 
			return func(err, obj);
		}); 
	}
}