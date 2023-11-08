const express = require('express');
const app = express();
const path = require('path');
const currentsapi = require('currentsapi');
const _ = require('lodash');
const axios = require('axios');
const NewsAPI = require('newsapi');

const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

const blogPosts = [];
const defaultFilterKeyword = '';
const newsapi = new NewsAPI('d53df0bdd45444ad8d49ccccd8a29842');

app.get('/', async (req, res) => {
  const userFilter = req.query.filter || defaultFilterKeyword;

  const newsResponse = await newsapi.v2.topHeadlines({
    q: userFilter,
    category: 'technology',
    country: 'us'
  });

  const news = newsResponse.articles;
  const currentsNews = await getCurrentsNews(userFilter);
  res.render('index', { blogPosts, news, currentsNews, userFilter });
});

async function getCurrentsNews(filter) {
  const apiKey = 'LJnxKdj-pWEor5Xf6_FBn6nfoAwif2L80pNHRFAkYK0G1oSH';
  const currents = new currentsapi(apiKey);

  const response = await currents.latestNews({ keywords: filter });

  if (response.status === 'ok') {
    return response.news;
  } else {
    return [];
  }
}

app.get('/add', (req, res) => {
  res.render('add');
});

app.get('/post/:id', (req, res) => {
  const postIndex = req.params.id;
  if (blogPosts[postIndex]) {
    res.render('post', { postIndex, blogPosts });
  } else {
    res.status(404).send('Сообщение не найдено');
  }
});

app.post('/add', (req, res) => {
  const { title, content } = req.body;
  if (title && content) {
    blogPosts.push({ title, content });
  }
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
