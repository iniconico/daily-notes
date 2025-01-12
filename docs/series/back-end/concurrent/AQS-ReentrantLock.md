---
title: AQS-ReentrantLock
date: 2021/12/08
tags:
 - AQS
categories:
 - back-end
---

## ReentrantLock使用

在加锁逻辑和try代码块之间一定不要添加其他逻辑

```java
    /**
     * 默认是非公平锁
     */
    private static Lock lock = new ReentrantLock();
    /**
     * 构造函数里面添加 true 创建一把公平锁
     */
    private static Lock fairLock = new ReentrantLock(true);

		 public static void main(String[] args) throws InterruptedException {
        for (int i = 0; i < 3; i++) {
            Thread thread = new Thread(() -> {
                //加锁
                lock.lock();
                try {
                    for (int j = 0; j < 10000; j++) {
                        sum++;
                    }
                } finally {
                    // 解锁
                    lock.unlock();
                }
            });
            thread.start();
        }
```

## 源码学习

-----------

### ReentrantLock构造器逻辑

```java
 		/**
     * Creates an instance of {@code ReentrantLock}.
     * This is equivalent to using {@code ReentrantLock(false)}.
     */
		public ReentrantLock() {
        sync = new NonfairSync();
    }
    /**
     * Creates an instance of {@code ReentrantLock} with the
     * given fairness policy.
     *
     * @param fair {@code true} if this lock should use a fair ordering policy
     */
    public ReentrantLock(boolean fair) {
        sync = fair ? new FairSync() : new NonfairSync();
    }
```

### Lock.lock()



非公平锁

```java
				/**
         * Performs lock.  Try immediate barge, backing up to normal
         * acquire on failure.
         */
        @ReservedStackAccess // 这个注解在源码中经常看见这个是JEP 270添加的新注解。
															//它会保护被注解的方法，通过添加一些额外的空间，防止在多线程运行的时候出现栈溢出
        final void lock() {
            if (compareAndSetState(0, 1)) // 非公平锁不论如何都会先去尝试CAS获取锁
                setExclusiveOwnerThread(Thread.currentThread()); // CAS成功后持有锁 lock当前对象中的独占锁持有线程即为当前线程
            else
                acquire(1); // CAS失败会尝试入队
        }
```



![](https://iniconico-image.oss-cn-chengdu.aliyuncs.com/typora/20211217155202.png)



CAS

```java
		protected final boolean compareAndSetState(int expect, int update) {
        // See below for intrinsics setup to support this
        return unsafe.compareAndSwapInt(this, stateOffset, expect, update);
    }
```

setExclusiveOwnerThread

```java
		protected final void setExclusiveOwnerThread(Thread thread) {
        exclusiveOwnerThread = thread;
    }
```



acquire(1)

```java
		@ReservedStackAccess
    public final void acquire(int arg) {
        if (!tryAcquire(arg) && acquireQueued(addWaiter(Node.EXCLUSIVE), arg)) // 尝试获取锁失败 并且 interupted = true
            selfInterrupt();
    }
```

非公平锁实现AQS的tryAcquire()方法

```java
		protected final boolean tryAcquire(int acquires) {
         return nonfairTryAcquire(acquires);
    }
```

nonfairTryAcquire(acquires)

```java
 				@ReservedStackAccess
        final boolean nonfairTryAcquire(int acquires) {
            final Thread current = Thread.currentThread();
            int c = getState();
            if (c == 0) {// c==0表示当前锁未被占用
                if (compareAndSetState(0, acquires)) {// 直接CAS尝试获取锁
                    setExclusiveOwnerThread(current);// CAS成功持有锁
                    return true;
                }
            }
            // 这里是重入锁的判断逻辑
            else if (current == getExclusiveOwnerThread()) {// 锁的持有者如果是当前线程则进入锁
                int nextc = c + acquires; // 当前state的值 + acquires 的值（请求资源数量）
                if (nextc < 0) // overflow
                    throw new Error("Maximum lock count exceeded");
                setState(nextc);// 当前state设置为 nextc
                return true;
            }
            return false;// 获取锁失败
        }

```

addWaiter(Node.EXCLUSIVE) //入队操作,返回节点 Node.EXCLUSIVE 表示独占锁

```
// AQS中的实现
static final Node EXCLUSIVE = null;
```

Node方法的构造器

```java
				Node(Thread thread, Node mode) {     // Used by addWaiter
            this.nextWaiter = mode;// 下一个节点
            this.thread = thread; // 当前线程
        }
```



```java
		private Node addWaiter(Node mode) {
        Node node = new Node(Thread.currentThread(), mode); // 创建一个新节点放入当前的线程和 这里直接mode == null 了
        // Try the fast path of enq; backup to full enq on failure
        Node pred = tail; // 获取尾节点
        if (pred != null) {// 尾节点不为空
            node.prev = pred;// 把当前节点的前一个节点设置为 尾节点
            if (compareAndSetTail(pred, node)) {
                pred.next = node;
                return node;
            }
        }
        enq(node); // 尾节点为空说明当前还没有创建队列 执行AQS的创建队列方法
        return node; // 返回Node节点
    }
```

enq(node) //如果没有队列就创建并返回，这里是AQS的CLH队列

```java
		private Node enq(final Node node) {
        for (;;) {
            Node t = tail;
            if (t == null) { // Must initialize
                if (compareAndSetHead(new Node()))//CAS设置头节点
                    tail = head;// 尾节点移过来
            } else {
                node.prev = t; // prev 指向头节点
                if (compareAndSetTail(t, node)) {// CAS把当前node设置为尾节点
                    t.next = node;// 尾节点的next -> node
                    return t;
                }
            }
        }
    }
```





acquireQueued(node,1)

```java
		@ReservedStackAccess
    final boolean acquireQueued(final Node node, int arg) {
        boolean failed = true; // 失败标记
        try {
            boolean interrupted = false; // 中断标记
            for (;;) {
                final Node p = node.predecessor();// 获取前一个节点 prev
                if (p == head && tryAcquire(arg)) {// 如果p是头节点并且尝试获取锁成功
                    setHead(node);// 头节点设为当前节点
                    p.next = null; // help GC prev的next指向去掉
                    failed = alse; 
                    return interrupted;// 返回中断标记
                }
                if (shouldParkAfterFailedAcquire(p, node) &&
                    parkAndCheckInterrupt())
                    interrupted = true;
            }
        } finally {
            if (failed) // 如果失败取消入队
                cancelAcquire(node);
        }
    }


    private static boolean shouldParkAfterFailedAcquire(Node pred, Node node) {
        int ws = pred.waitStatus;
        if (ws == Node.SIGNAL)
            /*
             * This node has already set status asking a release
             * to signal it, so it can safely park.
             */
            return true;
        if (ws > 0) {
            /*
             * Predecessor was cancelled. Skip over predecessors and
             * indicate retry.
             */
            do {
                node.prev = pred = pred.prev;
            } while (pred.waitStatus > 0);
            pred.next = node;
        } else {
            /*
             * waitStatus must be 0 or PROPAGATE.  Indicate that we
             * need a signal, but don't park yet.  Caller will need to
             * retry to make sure it cannot acquire before parking.
             */
            compareAndSetWaitStatus(pred, ws, Node.SIGNAL);
        }
        return false;
    }

		private final boolean parkAndCheckInterrupt() {
        LockSupport.park(this); // 阻塞当前线程
        return Thread.interrupted(); // 返回中断标记
    }	

```



```java
	private void cancelAcquire(Node node) {
        // Ignore if node doesn't exist
        if (node == null)
            return;

        node.thread = null;

        // Skip cancelled predecessors
        Node pred = node.prev;
        while (pred.waitStatus > 0)
            node.prev = pred = pred.prev;

        // predNext is the apparent node to unsplice. CASes below will
        // fail if not, in which case, we lost race vs another cancel
        // or signal, so no further action is necessary.
        Node predNext = pred.next;

        // Can use unconditional write instead of CAS here.
        // After this atomic step, other Nodes can skip past us.
        // Before, we are free of interference from other threads.
        node.waitStatus = Node.CANCELLED;

        // If we are the tail, remove ourselves.
        if (node == tail && compareAndSetTail(node, pred)) {
            compareAndSetNext(pred, predNext, null);
        } else {
            // If successor needs signal, try to set pred's next-link
            // so it will get one. Otherwise wake it up to propagate.
            int ws;
            if (pred != head &&
                ((ws = pred.waitStatus) == Node.SIGNAL ||
                 (ws <= 0 && compareAndSetWaitStatus(pred, ws, Node.SIGNAL))) &&
                pred.thread != null) {
                Node next = node.next;
                if (next != null && next.waitStatus <= 0)
                    compareAndSetNext(pred, predNext, next);
            } else {
                unparkSuccessor(node);
            }

            node.next = node; // help GC
        }
    }


```

