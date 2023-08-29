public class Play{
    public static void main(String[] args){
        int[] arr = {1, -3, -5, 8, -7, 9, -10};

        for(int i=0;i<arr.length;i++){
            if(arr[i]<0){ 
                int j=i;
                while(j<arr.length && arr[j]<0){
                    j++;
                }
                if(j>=arr.length){
                    j--;
                }
                int t = arr[i];
                arr[i] = arr[j];
                arr[j] = t;
            }
        }

        for(int e: arr){
            System.out.println(e+" ");
        }
    }
}


// select name, sum(orders.id) from users, order where users.id=orders.id and orders.date<"some post date" and orders.date> "some prev date" group by orders.id;


// select row(3) from employee orderby salary desc limit 3 