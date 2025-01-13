import{_ as a,c as l,a as e,o as n}from"./app-CtC7YmlN.js";const t={};function s(r,i){return n(),l("div",null,i[0]||(i[0]=[e('<h2 id="aqs原理分析" tabindex="-1"><a class="header-anchor" href="#aqs原理分析"><span>AQS原理分析</span></a></h2><hr><h2 id="aqs具备的特性" tabindex="-1"><a class="header-anchor" href="#aqs具备的特性"><span>AQS具备的特性</span></a></h2><ul><li>阻塞等待队列</li><li>共享/独占</li><li>公平/非公平</li><li>可重入</li><li>允许中断</li></ul><hr><h2 id="aqs内部维护属性" tabindex="-1"><a class="header-anchor" href="#aqs内部维护属性"><span>AQS内部维护属性</span></a></h2><p>volatile int state</p><p>State 表示资源的可用状态</p><p>state的三种访问方式：</p><ul><li>getState（）</li><li>setState（）</li><li>compareAndSetState（）</li></ul><hr><h2 id="aqs定义了两种资源共享方式" tabindex="-1"><a class="header-anchor" href="#aqs定义了两种资源共享方式"><span>AQS定义了两种资源共享方式</span></a></h2><ul><li>Exclusive 独占，只有一个线程能够执行，如 ReentrantLock</li><li>Share 共享，多个线程可以同时执行，如 Semaphore/CountDownLatch</li></ul><hr><h2 id="aqs定义了两种队列" tabindex="-1"><a class="header-anchor" href="#aqs定义了两种队列"><span>AQS定义了两种队列</span></a></h2><h3 id="同步等待队列" tabindex="-1"><a class="header-anchor" href="#同步等待队列"><span>同步等待队列</span></a></h3><p>主要用于维护获取锁失败时入队的线程</p><p>AQS中的同步等待队列也称为CLH队列，CLH队列是一种基于双向链表数据结构的队列，是FIFO 先进先出线程等待队列，Java中断CLH 队列是原 CLH 队列中的一个变种，线程由原自旋机制改为阻塞机制。</p><p>AQS 依赖CLH同步队列来完成同步状态的管理：</p><ul><li>当前线程如果获取同步状态失败时，AQS则会将当前线程已经等待状态等信息构造成一个节点（Node）并将其加入到CLH同步队列，同时会阻塞当前线程</li><li>当同步状态释放时，会把首节点唤醒（公平锁），使其再次尝试获取同步状态。</li><li>通过signal或signalAll将条件队列中的节点转移到同步队列。（由条件队列转化为同步队列）</li></ul><p><img src="https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/24984.png" alt=""></p><h3 id="条件等待队列" tabindex="-1"><a class="header-anchor" href="#条件等待队列"><span>条件等待队列</span></a></h3><p>AQS中条件队列是使用单向列表保存的，用nextWaiter来连接:</p><ul><li>调用await方法阻塞线程；</li><li>当前线程存在于同步队列的头结点，调用await方法进行阻塞（从同步队列转化到条件队列）</li></ul><p>Condition接口</p><p><img src="https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/24983.png" alt=""></p><ol><li>调用Condition#await方法会释放当前持有的锁，然后阻塞当前线程，同时向Condition队列尾部添加一个节点，所以调用Condition#await方法的时候必须持有锁。</li><li>调用Condition#signal方法会将Condition队列的首节点移动到阻塞队列尾部，然后唤醒因调用Condition#await方法而阻塞的线程(唤醒之后这个线程就可以去竞争锁了)，所以调用Condition#signal方法的时候必须持有锁，持有锁的线程唤醒被因调用Condition#await方法而阻塞的线程。</li></ol><hr><h2 id="aqs定义了5个队列中的状态" tabindex="-1"><a class="header-anchor" href="#aqs定义了5个队列中的状态"><span>AQS定义了5个队列中的状态</span></a></h2><ol><li>初始化状态，值为 0 ，表示当前节点在 sync 队列中，等待获取锁</li><li>CANCELLED，值为 1，表示当前的线程被取消</li><li>SIGNAL，值为 -1，表示当前节点的后继节点包含的线程需要运行，也就是 unpark</li><li>CONDITION，值为 -2，表示当前节点在等待 condition，也就是在 condition 队列中</li><li>PROPAGATE，值为 -3，表示当前场景下后续的 acquireShared 能够得以执行</li></ol><p>不同的自定义同步器竞争共享资源的方式也不同。自定义同步器在实现时只需要实现共享资源state的获取与释放方式即可，至于具体线程等待队列的维护（如获取资源失败入队/唤醒出队等），AQS已经在顶层实现好了。自定义同步器实现时主要实现以下几种方法：</p><ul><li>isHeldExclusively()：该线程是否正在独占资源。只有用到condition才需要去实现它。</li><li>tryAcquire(int)：独占方式。尝试获取资源，成功则返回true，失败则返回false。</li><li>tryRelease(int)：独占方式。尝试释放资源，成功则返回true，失败则返回false。</li><li>tryAcquireShared(int)：共享方式。尝试获取资源。负数表示失败；0表示成功，但没有剩余可用资源；正数表示成功，且有剩余资源。</li><li>tryReleaseShared(int)：共享方式。尝试释放资源，如果释放后允许唤醒后续等待结点返回true，否则返回false。</li></ul>',32)]))}const o=a(t,[["render",s],["__file","AQSxuexi.html.vue"]]),h=JSON.parse('{"path":"/series/back-end/concurrent/AQSxuexi.html","title":"AQS学习","lang":"en-US","frontmatter":{"title":"AQS学习","date":"2021/12/05","tags":["AQS"],"categories":["back-end"]},"headers":[{"level":2,"title":"AQS原理分析","slug":"aqs原理分析","link":"#aqs原理分析","children":[]},{"level":2,"title":"AQS具备的特性","slug":"aqs具备的特性","link":"#aqs具备的特性","children":[]},{"level":2,"title":"AQS内部维护属性","slug":"aqs内部维护属性","link":"#aqs内部维护属性","children":[]},{"level":2,"title":"AQS定义了两种资源共享方式","slug":"aqs定义了两种资源共享方式","link":"#aqs定义了两种资源共享方式","children":[]},{"level":2,"title":"AQS定义了两种队列","slug":"aqs定义了两种队列","link":"#aqs定义了两种队列","children":[{"level":3,"title":"同步等待队列","slug":"同步等待队列","link":"#同步等待队列","children":[]},{"level":3,"title":"条件等待队列","slug":"条件等待队列","link":"#条件等待队列","children":[]}]},{"level":2,"title":"AQS定义了5个队列中的状态","slug":"aqs定义了5个队列中的状态","link":"#aqs定义了5个队列中的状态","children":[]}],"git":{"createdTime":1736659621000,"updatedTime":1736659621000,"contributors":[{"name":"iniconico","email":"632546065@qq.com","commits":1}]},"filePathRelative":"series/back-end/concurrent/AQS学习.md"}');export{o as comp,h as data};
