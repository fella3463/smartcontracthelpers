// 引入依赖
const express = require('express');
const dotenv = require('dotenv');
const Web3 = require('web3');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');

// 初始化环境变量
dotenv.config();

// 创建 Express 应用
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 设置 Web3 提供者
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.INFURA_URL));

// 设置 ethers 提供者
const ethersProvider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

// 示例合约地址和ABI
const contractAddress = '0x...'; // 替换为您的合约地址
const contractABI = [...]; // 替换为您的合约ABI

// 创建合约实例
const contract = new web3.eth.Contract(contractABI, contractAddress);

// 定义一个中间件检查 JWT 令牌
const checkAuthToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ message: 'No token provided.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(500).send({ message: 'Failed to authenticate token.' });
        req.userId = decoded.id;
        next();
    });
};

// 定义一个 GET 路由
app.get('/api/data', checkAuthToken, async (req, res) => {
    try {
        // 假设 'getData' 是智能合约中的一个方法
        const data = await contract.methods.getData().call();
        res.json({ data });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error getting data from the smart contract');
    }
});

// 定义一个 POST 路由
app.post('/api/update', checkAuthToken, async (req, res) => {
    const { updateData } = req.body;
    // 模拟异步操作，比如与区块链交互
    try {
        // 假设 'updateData' 是智能合约中的一个方法
        // 这里需要一个已签名的事务，因此较为复杂
        const signer = new ethers.Wallet(process.env.PRIVATE_KEY, ethersProvider);
        const contractWithSigner = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contractWithSigner.updateData(updateData);
        await tx.wait();
        res.send({ message: 'Data updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating data on the smart contract');
    }
});

// 启动服务器
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
