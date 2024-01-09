
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;
const sqlite3 = require('sqlite3');
/*const sequelize = new Sequelize(process.env.DB_SCHEMA || 'postgres',
                                process.env.DB_USER || 'postgres',
                                process.env.DB_PASSWORD || '',
                                {
                                    host: process.env.DB_HOST || 'localhost',
                                    port: process.env.DB_PORT || 5432,
                                    dialect: 'postgres',
                                    dialectOptions: {
                                        ssl: process.env.DB_SSL == "true"
                                    }
                                });*/
const name = "gstrdnp";

const getStoragePath = ()=>{
    let storagePath = `${process.env.SQLITE_DBS_LOCATION}/${name}`
    console.log(`STORAGE PATH: ${storagePath}`);
    return storagePath;
};

const sequelize = new Sequelize({
    dialect: "sqlite",
    dialectModule: sqlite3,
    storage: getStoragePath()
    //storage: 'testStorageFile'
  });
//const sequelize = new Sequelize('sqlite::memory:');
const Person = sequelize.define('Person', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
		unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
		unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

const Category = sequelize.define('Category', {
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

const Product = sequelize.define('Product', {
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Category,
            key: 'category_id'
        }
    }
});

const State = sequelize.define('State', {
    state_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

const Order = sequelize.define('Order', {
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    confirmation_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    state: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: State,
            key: 'state_id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Person,
            key: 'user_id'
        }
    }
});

const Product_Order = sequelize.define('Product_Order', {
    product_order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Product,
            key: 'product_id'
        }
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Order,
            key: 'order_id'
        }
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

/*const LoginInstance = sequelize.define("LoginInstance", {
	login_id: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true,
		primaryKey: true,
	},
	user: {
		type: Sequelize.STRING,
		allowNull: false,
		references: {
			model: Person,
			key: "username",
		},
		onUpdate: "CASCADE",
		onDelete: "CASCADE",
	}
})*/


module.exports = {
    sequelize: sequelize,
    Person: Person,
    Product: Product,
    Category: Category,
    Product_Order: Product_Order,
    Order: Order,
    State: State
	//LoginInstance: LoginInstance
    //name: name //hide/delete?
};