---
title: Synchronized字节码
date: 2021/12/16
tags:
 - Synchronized
categories:
 - back-end
---
## Code

```java
	@Slf4j
public class SyncDemo2 {

    private static int counter = 0;

    private static String lock = "";

    public static void increment() {
        synchronized (lock) {
            counter++;
        }
    }

    public static void incr() {
        counter++;
    }

    public static void decrement() {
        synchronized (lock) {
            counter--;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
                for (int i = 0; i < 5000; i++) {
                    increment();
                }
        }, "t1");
        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 5000; i++) {
                decrement();
            }
        }, "t2");
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        //思考： counter=？
        log.info("counter={}", counter);
    }
}

```



## 字节码

### increment

```tex
 0 getstatic #2 <com/tuling/jucdemo/sync/SyncDemo2.lock : Ljava/lang/String;>
 3 dup
 4 astore_0
 5 monitorenter // 监视器 in
 6 getstatic #3 <com/tuling/jucdemo/sync/SyncDemo2.counter : I>
 9 iconst_1
10 iadd
11 putstatic #3 <com/tuling/jucdemo/sync/SyncDemo2.counter : I>
14 aload_0
15 monitorexit // 监视器 out
16 goto 24 (+8)
19 astore_1
20 aload_0
21 monitorexit
22 aload_1
23 athrow
24 return
```



### incr

```tex
0 getstatic #3 <com/tuling/jucdemo/sync/SyncDemo2.counter : I>
3 iconst_1
4 iadd
5 putstatic #3 <com/tuling/jucdemo/sync/SyncDemo2.counter : I>
8 return
```

