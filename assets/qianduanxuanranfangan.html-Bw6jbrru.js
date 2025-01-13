import{_ as a,c as n,a as l,o as i}from"./app-CtC7YmlN.js";const s={};function d(r,e){return i(),n("div",null,e[0]||(e[0]=[l('<h3 id="ssr" tabindex="-1"><a class="header-anchor" href="#ssr"><span>SSR</span></a></h3><p>Server Side Rendering，见名知意，即服务端渲染，传统的 Jsp, php，都是服务端渲染</p><h4 id="优点" tabindex="-1"><a class="header-anchor" href="#优点"><span>优点</span></a></h4><ol><li>有利于SEO</li><li>有利于首屏渲染</li></ol><h4 id="缺点" tabindex="-1"><a class="header-anchor" href="#缺点"><span>缺点</span></a></h4><ol><li>占用服务器资源，渲染工作都在服务端进行</li><li>用户体验差，每次跳转到新页面都需要重新在服务端渲染整个页面，不能只渲染可变区域</li></ol><h3 id="csr" tabindex="-1"><a class="header-anchor" href="#csr"><span>CSR</span></a></h3><p>Client Side Rendering，客户端渲染，目前流行的<code>SPA</code>应用基本都是这类，客户端请求返回一个<code>index.html</code>页面 可以看到，当前页面除了 <code>&lt;div id = &#39;root&#39;&gt;&lt;/div&gt;</code>没有别的元素了，然后通过加载 <code>bundle.js</code>, <code>main.chunk.js</code>来执行渲染，整个渲染过程包括，生成DOM节点，注入样式，绑定js事件，获取数据等 但是这种方式不利于 <code>SEO</code>，首屏渲染时间可能比较长</p><h4 id="优点-1" tabindex="-1"><a class="header-anchor" href="#优点-1"><span>优点</span></a></h4><ol><li>前后端分离，各自独立开发</li><li>服务器压力变轻了</li><li>用户在后续访问操作体验好，可以把网站做成SPA，实现增量渲染</li></ol><h4 id="缺点-1" tabindex="-1"><a class="header-anchor" href="#缺点-1"><span>缺点</span></a></h4><ol><li>不利于SEO</li><li>首屏渲染时间比较长，因为需要页面执行ajax获取数据后渲染页面，如果请求接口多，不利于首屏渲染</li></ol><h3 id="ssg" tabindex="-1"><a class="header-anchor" href="#ssg"><span>SSG</span></a></h3><p>Static Side Generation，静态站点生成，在构建的时候直接把结果页面输出html到磁盘，用户访问的时候直接返回html页面，相当于一个静态资源</p><h3 id="ssr-1" tabindex="-1"><a class="header-anchor" href="#ssr-1"><span>SSR</span></a></h3><p>Server Side Rendering，见名知意，即服务端渲染，传统的 Jsp, php，都是服务端渲染</p><h4 id="优点-2" tabindex="-1"><a class="header-anchor" href="#优点-2"><span>优点</span></a></h4><ol><li>有利于SEO</li><li>有利于首屏渲染</li></ol><h4 id="缺点-2" tabindex="-1"><a class="header-anchor" href="#缺点-2"><span>缺点</span></a></h4><ol><li>占用服务器资源，渲染工作都在服务端进行</li><li>用户体验差，每次跳转到新页面都需要重新在服务端渲染整个页面，不能只渲染可变区域</li></ol><h3 id="csr-1" tabindex="-1"><a class="header-anchor" href="#csr-1"><span>CSR</span></a></h3><p>Client Side Rendering，客户端渲染，目前流行的<code>SPA</code>应用基本都是这类，客户端请求返回一个<code>index.html</code>页面 可以看到，当前页面除了 <code>&lt;div id = &#39;root&#39;&gt;&lt;/div&gt;</code>没有别的元素了，然后通过加载 <code>bundle.js</code>, <code>main.chunk.js</code>来执行渲染，整个渲染过程包括，生成DOM节点，注入样式，绑定js事件，获取数据等 但是这种方式不利于 <code>SEO</code>，首屏渲染时间可能比较长</p><h4 id="优点-3" tabindex="-1"><a class="header-anchor" href="#优点-3"><span>优点</span></a></h4><ol><li>前后端分离，各自独立开发</li><li>服务器压力变轻了</li><li>用户在后续访问操作体验好，可以把网站做成SPA，实现增量渲染</li></ol><h4 id="缺点-3" tabindex="-1"><a class="header-anchor" href="#缺点-3"><span>缺点</span></a></h4><ol><li>不利于SEO</li><li>首屏渲染时间比较长，因为需要页面执行ajax获取数据后渲染页面，如果请求接口多，不利于首屏渲染</li></ol><h3 id="ssg-1" tabindex="-1"><a class="header-anchor" href="#ssg-1"><span>SSG</span></a></h3><p>Static Side Generation，静态站点生成，在构建的时候直接把结果页面输出html到磁盘，用户访问的时候直接返回html页面，相当于一个静态资源</p>',28)]))}const c=a(s,[["render",d],["__file","qianduanxuanranfangan.html.vue"]]),t=JSON.parse('{"path":"/blogs/front-end/qianduanxuanranfangan.html","title":"前端渲染方案","lang":"en-US","frontmatter":{"title":"前端渲染方案","date":"2024/08/15","tags":["render"],"categories":["front-end"]},"headers":[{"level":3,"title":"SSR","slug":"ssr","link":"#ssr","children":[]},{"level":3,"title":"CSR","slug":"csr","link":"#csr","children":[]},{"level":3,"title":"SSG","slug":"ssg","link":"#ssg","children":[]},{"level":3,"title":"SSR","slug":"ssr-1","link":"#ssr-1","children":[]},{"level":3,"title":"CSR","slug":"csr-1","link":"#csr-1","children":[]},{"level":3,"title":"SSG","slug":"ssg-1","link":"#ssg-1","children":[]}],"git":{"createdTime":1736659621000,"updatedTime":1736659621000,"contributors":[{"name":"iniconico","email":"632546065@qq.com","commits":1}]},"filePathRelative":"blogs/front-end/前端渲染方案.md"}');export{c as comp,t as data};